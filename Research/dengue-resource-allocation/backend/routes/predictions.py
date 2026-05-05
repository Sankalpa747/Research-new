"""
Prediction Routes
Handles risk prediction and resource recommendation generation
"""

from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from typing import Dict, List
import pandas as pd

from backend.schemas import PredictionResponse, SuccessResponse
from backend.json_store import get_store
from backend.utils import (
    get_timestamp,
    format_district_predictions,
    format_hotspots,
    create_success_response
)
from backend.config import PROCESSED_DATA_PATH, ALLOCATION_MODEL_PATH, DISTRICT_DATA
from ml.allocation_predictor import predict_resources

router = APIRouter(prefix="/predictions", tags=["Predictions"])

# Global prediction system (initialized at startup)
_prediction_system = None


def set_prediction_system(system):
    """Set the global prediction system instance"""
    global _prediction_system
    _prediction_system = system


def get_prediction_system():
    """Get the global prediction system instance"""
    if _prediction_system is None:
        raise RuntimeError("Prediction system not initialized")
    return _prediction_system


@router.post("/generate", response_model=PredictionResponse)
async def generate_predictions(background_tasks: BackgroundTasks):
    """
    Task 1: Create endpoint to trigger risk prediction
    Task 2: Create endpoint to generate resource recommendations
    
    Generate complete predictions including:
    - District risk levels (Low/Medium/High)
    - Hotspot identification
    - Resource recommendations
    
    Predictions are saved to JSON store for later access
    """
    try:
        # Load latest district data
        df = pd.read_csv(PROCESSED_DATA_PATH)
        
        # Get most recent data for each district
        df['Date'] = pd.to_datetime(
            df['Year'].astype(str) + '-' + df['Month'].astype(str) + '-01'
        )
        latest_data = df.sort_values('Date').groupby('District').tail(1).reset_index(drop=True)
        
        # Get prediction system
        predictor = get_prediction_system()
        
        # Generate complete predictions
        results = predictor.generate_complete_predictions(latest_data)
        
        # Extract data
        predictions_df = results['predictions']
        summary = results['summary']
        
        # Format for storage
        predictions_list = format_district_predictions(predictions_df)
        hotspots_list = format_hotspots(predictions_df)
        
        # Extract resource recommendations
        resource_cols = ['District', 'Fogging_Units', 'Health_Inspectors', 
                        'Inspection_Teams', 'Treatment_Units']
        recommendations_df = predictions_df[resource_cols].copy()
        recommendations_list = recommendations_df.to_dict('records')
        
        # Save to JSON store
        store = get_store()
        store.save_district_predictions(predictions_list)
        store.save_hotspots(hotspots_list)
        store.save_resource_recommendations(recommendations_list)
        
        return PredictionResponse(
            status="success",
            message="Predictions generated successfully",
            predictions_count=len(predictions_list),
            hotspots_count=len(hotspots_list),
            timestamp=get_timestamp()
        )
    
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Processed data file not found: {PROCESSED_DATA_PATH}"
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate predictions: {str(e)}"
        )


@router.get("/districts", response_model=Dict)
async def get_district_predictions():
    """
    Get current district risk predictions
    """
    try:
        store = get_store()
        predictions = store.get_district_predictions()
        
        if not predictions:
            return {
                "status": "success",
                "message": "No predictions available. Please generate predictions first.",
                "count": 0,
                "predictions": [],
                "timestamp": get_timestamp()
            }
        
        return {
            "status": "success",
            "message": "District predictions retrieved successfully",
            "count": len(predictions),
            "predictions": predictions,
            "timestamp": get_timestamp()
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve predictions: {str(e)}"
        )


@router.get("/districts/{district_name}", response_model=Dict)
async def get_district_prediction(district_name: str):
    """
    Get risk prediction for a specific district
    """
    try:
        store = get_store()
        predictions = store.get_district_predictions()
        
        # Find district (case-insensitive)
        district_pred = None
        for pred in predictions:
            if pred.get('District', '').lower() == district_name.lower():
                district_pred = pred
                break
        
        if not district_pred:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No prediction found for district: {district_name}"
            )
        
        return {
            "status": "success",
            "message": f"Prediction for {district_name} retrieved successfully",
            "district": district_pred,
            "timestamp": get_timestamp()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve district prediction: {str(e)}"
        )


@router.get("/hotspots", response_model=Dict)
async def get_hotspots():
    """
    Get current dengue hotspots (high-risk districts)
    """
    try:
        store = get_store()
        hotspots = store.get_hotspots()
        
        return {
            "status": "success",
            "message": "Hotspots retrieved successfully",
            "count": len(hotspots),
            "hotspots": hotspots,
            "timestamp": get_timestamp()
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve hotspots: {str(e)}"
        )


@router.get("/recommendations", response_model=Dict)
async def get_resource_recommendations():
    """
    Get ML-generated resource recommendations for all districts
    """
    try:
        store = get_store()
        recommendations = store.get_resource_recommendations()
        
        if not recommendations:
            return {
                "status": "success",
                "message": "No recommendations available. Please generate predictions first.",
                "count": 0,
                "recommendations": [],
                "timestamp": get_timestamp()
            }
        
        # Calculate totals
        totals = {
            'Fogging_Units': sum(r.get('Fogging_Units', 0) for r in recommendations),
            'Health_Inspectors': sum(r.get('Health_Inspectors', 0) for r in recommendations),
            'Inspection_Teams': sum(r.get('Inspection_Teams', 0) for r in recommendations),
            'Treatment_Units': sum(r.get('Treatment_Units', 0) for r in recommendations)
        }
        
        return {
            "status": "success",
            "message": "Resource recommendations retrieved successfully",
            "count": len(recommendations),
            "recommendations": recommendations,
            "totals": totals,
            "timestamp": get_timestamp()
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve recommendations: {str(e)}"
        )


@router.get("/recommendations/{district_name}", response_model=Dict)
async def get_district_recommendation(district_name: str):
    """
    Get resource recommendation for a specific district
    """
    try:
        store = get_store()
        recommendations = store.get_resource_recommendations()
        
        # Find district (case-insensitive)
        district_rec = None
        for rec in recommendations:
            if rec.get('District', '').lower() == district_name.lower():
                district_rec = rec
                break
        
        if not district_rec:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No recommendation found for district: {district_name}"
            )
        
        return {
            "status": "success",
            "message": f"Recommendation for {district_name} retrieved successfully",
            "district": district_name,
            "recommendation": district_rec,
            "timestamp": get_timestamp()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve district recommendation: {str(e)}"
        )


@router.delete("/clear", response_model=SuccessResponse)
async def clear_predictions():
    """
    Clear all stored predictions (useful for testing or reset)
    """
    try:
        store = get_store()
        store.save_district_predictions([])
        store.save_hotspots([])
        store.save_resource_recommendations([])
        
        return SuccessResponse(
            message="All predictions cleared successfully",
            data={"cleared": True},
            timestamp=get_timestamp()
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear predictions: {str(e)}"
        )


# ──────────────────────────────────────────────────────────────────────────────
# ML-based resource allocation endpoints (resource_allocation_model.pkl)
# Input features: population + houses
# Outputs: health_inspectors, fogging_units, inspection_teams, inspection_days
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/allocate/{district_name}", response_model=Dict)
async def allocate_resources_for_district(district_name: str):
    """
    Use the trained ML model to predict required resources for a district.

    Looks up district population and house count from the built-in dataset,
    then runs resource_allocation_model.pkl to produce:
      - health_inspectors
      - fogging_units
      - inspection_teams
      - inspection_days  (estimated days to inspect all houses)
    """
    # Normalise name for lookup (title-case)
    key = district_name.strip().title()
    district_info = DISTRICT_DATA.get(key)

    if not district_info:
        # Try case-insensitive fallback
        for k, v in DISTRICT_DATA.items():
            if k.lower() == district_name.lower():
                key = k
                district_info = v
                break

    if not district_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"District '{district_name}' not found. Available districts: {sorted(DISTRICT_DATA.keys())}"
        )

    try:
        population = district_info["population"]
        houses     = district_info["houses"]

        resources = predict_resources(
            population=population,
            houses=houses,
            model_path=str(ALLOCATION_MODEL_PATH)
        )

        return {
            "status":  "success",
            "district": key,
            "population": population,
            "houses": houses,
            "predicted_resources": resources,
            "report": (
                f"District: {key}\n"
                f"Total Houses: {houses:,}\n\n"
                f"Required Resources:\n"
                f"Health Inspectors: {resources['health_inspectors']}\n"
                f"Fogging Units: {resources['fogging_units']}\n"
                f"Inspection Teams: {resources['inspection_teams']}\n"
                f"Estimated Days to Inspect All Houses: {resources['inspection_days']} days"
            ),
            "timestamp": get_timestamp()
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed for district '{district_name}': {str(e)}"
        )


@router.post("/allocate", response_model=Dict)
async def allocate_resources_custom(body: Dict):
    """
    Predict resources for custom population and house count values.

    Request body:
        { "population": 1000000, "houses": 250000 }
    """
    population = body.get("population")
    houses     = body.get("houses")

    if population is None or houses is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request body must include 'population' and 'houses'."
        )

    try:
        resources = predict_resources(
            population=int(population),
            houses=int(houses),
            model_path=str(ALLOCATION_MODEL_PATH)
        )

        return {
            "status": "success",
            "population": int(population),
            "houses": int(houses),
            "predicted_resources": resources,
            "timestamp": get_timestamp()
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.get("/districts-list", response_model=Dict)
async def get_all_districts_with_data():
    """
    Return all 25 districts with their population and house counts.
    """
    return {
        "status": "success",
        "count": len(DISTRICT_DATA),
        "districts": [
            {"name": k, "population": v["population"], "houses": v["houses"]}
            for k, v in sorted(DISTRICT_DATA.items())
        ],
        "timestamp": get_timestamp()
    }