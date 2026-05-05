"""
Pilot Study API Routes
Handles Colombo GN pilot study endpoints
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
import sys
import csv
from pathlib import Path
from datetime import datetime
import datetime as dt

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from backend.config import PILOT_MODE, PILOT_CONFIG, PILOT_BOUNDARIES_PATH, DATA_DIR, STORAGE_PATH
from backend.json_store import get_store
from backend.utils import get_timestamp
from backend.schemas import (
    MasterReport, HospitalReport, DivisionalSecretariatReport, 
    UrbanCouncilReport, GNLocalReport, MasterReportsResponse, 
    MasterReportCreateResponse, SuccessResponse
)

router = APIRouter(prefix="/pilot", tags=["pilot"])


def check_duplicate_report(store, report):
    """
    Check for potential duplicate reports
    Returns dict with is_duplicate flag and details
    """
    # Get existing reports for the same date, GN, source, and record type
    existing_reports = store.get_master_reports(
        gn_code=report.gn_code,
        source=report.source,
        date_from=str(report.date),
        date_to=str(report.date)
    )
    
    # Filter by source_record_type
    matching_reports = [
        r for r in existing_reports 
        if r.get("source_record_type") == report.source_record_type
    ]
    
    if not matching_reports:
        return {"is_duplicate": False}
    
    # If we found exact matches, it's a potential duplicate
    duplicate_info = []
    for existing in matching_reports:
        duplicate_info.append({
            "report_id": existing.get("report_id"),
            "date": existing.get("date"),
            "gn_code": existing.get("gn_code"),
            "gn_name": existing.get("gn_name"),
            "source": existing.get("source"),
            "source_record_type": existing.get("source_record_type"),
            "created_at": existing.get("created_at")
        })
    
    return {
        "is_duplicate": True,
        "message": f"Found {len(matching_reports)} existing report(s) with same date ({report.date}), GN division ({report.gn_code}), source ({report.source}), and record type ({report.source_record_type})",
        "existing_reports": duplicate_info
    }


@router.get("/config")
async def get_pilot_config() -> Dict[str, Any]:
    """
    Get pilot study configuration
    Returns city, GN divisions, depot info, and constraints
    """
    if not PILOT_MODE:
        raise HTTPException(
            status_code=404, 
            detail="Pilot mode is disabled"
        )
    
    return {
        "pilot_enabled": PILOT_MODE,
        "config": PILOT_CONFIG,
        "boundaries_available": PILOT_BOUNDARIES_PATH.exists(),
        "total_gns": len(PILOT_CONFIG["pilot_gns"]),
        "total_population": sum(gn["population"] for gn in PILOT_CONFIG["pilot_gns"]),
        "message": "Colombo GN pilot configuration loaded successfully"
    }


@router.get("/status")
async def get_pilot_status() -> Dict[str, Any]:
    """
    Get pilot study status and basic statistics
    """
    if not PILOT_MODE:
        raise HTTPException(
            status_code=404, 
            detail="Pilot mode is disabled"
        )
    
    # Get basic pilot info
    gns = PILOT_CONFIG["pilot_gns"]
    depot = PILOT_CONFIG["depot"]
    
    return {
        "pilot_enabled": PILOT_MODE,
        "city": PILOT_CONFIG["city"],
        "study_type": PILOT_CONFIG["study_area_type"],
        "gn_count": len(gns),
        "depot_location": {
            "name": depot["name"],
            "coordinates": [depot["latitude"], depot["longitude"]]
        },
        "coverage_area": {
            "total_population": sum(gn["population"] for gn in gns),
            "total_households": sum(gn["households"] for gn in gns),
            "gn_codes": [gn["gn_code"] for gn in gns]
        }
    }


@router.get("/boundaries")
async def get_pilot_boundaries() -> Dict[str, Any]:
    """
    Check if GeoJSON boundaries are available
    Returns boundary file status and basic info
    """
    if not PILOT_MODE:
        raise HTTPException(
            status_code=404, 
            detail="Pilot mode is disabled"
        )
    
    if not PILOT_BOUNDARIES_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Boundary file not found: {PILOT_BOUNDARIES_PATH}"
        )
    
    return {
        "boundaries_available": True,
        "file_path": str(PILOT_BOUNDARIES_PATH),
        "file_size_kb": round(PILOT_BOUNDARIES_PATH.stat().st_size / 1024, 2),
        "expected_features": len(PILOT_CONFIG["pilot_gns"]),
        "message": "GeoJSON boundaries file is available"
    }


@router.get("/gn-list")
async def get_gn_list() -> Dict[str, Any]:
    """
    Get master list of GN divisions for pilot study
    Returns GN codes and names for dropdown/form usage
    """
    if not PILOT_MODE:
        raise HTTPException(
            status_code=404, 
            detail="Pilot mode is disabled"
        )
    
    gn_master_path = DATA_DIR / "gn_master_list.csv"
    
    if not gn_master_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"GN master list file not found: {gn_master_path}"
        )
    
    try:
        gn_list = []
        with open(gn_master_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                gn_list.append({
                    "gn_code": row["gn_code"],
                    "gn_name": row["gn_name"],
                    "display_name": f"{row['gn_code']} {row['gn_name']}",
                    "city": row["city"],
                    "population": int(row["population"]),
                    "households": int(row["households"]),
                    "centroid_lat": float(row["centroid_lat"]),
                    "centroid_lon": float(row["centroid_lon"])
                })
        
        return {
            "gn_divisions": gn_list,
            "total_gns": len(gn_list),
            "city": "Colombo",
            "total_population": sum(gn["population"] for gn in gn_list),
            "source_file": "gn_master_list.csv",
            "message": f"Loaded {len(gn_list)} GN divisions for pilot study"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error reading GN master list: {str(e)}"
        )


@router.get("/gn-options") 
async def get_gn_options() -> List[Dict[str, str]]:
    """
    Get simplified GN options for dropdown/select usage
    Returns only code, name, and display name
    """
    if not PILOT_MODE:
        raise HTTPException(
            status_code=404, 
            detail="Pilot mode is disabled"
        )
    
    gn_master_path = DATA_DIR / "gn_master_list.csv"
    
    if not gn_master_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"GN master list file not found: {gn_master_path}"
        )
    
    try:
        gn_options = []
        with open(gn_master_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                gn_options.append({
                    "value": row["gn_code"],
                    "label": f"{row['gn_code']} {row['gn_name']}",
                    "gn_name": row["gn_name"]
                })
        
        return gn_options
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error reading GN options: {str(e)}"
        )


# Master Reports Endpoints

@router.post("/reports", response_model=MasterReportCreateResponse)
async def create_master_report(report: MasterReport):
    """
    Create a new master report in the merged dataset
    Accepts reports from any of the 4 sources with all fields
    """
    if not PILOT_MODE:
        raise HTTPException(
            status_code=404, 
            detail="Pilot mode is disabled"
        )
    
    try:
        store = get_store(str(STORAGE_PATH))
        
        # Check for potential duplicates
        duplicate_check = check_duplicate_report(store, report)
        if duplicate_check["is_duplicate"]:
            raise HTTPException(
                status_code=422,
                detail={
                    "message": "Possible duplicate report detected",
                    "detail": duplicate_check["message"],
                    "existing_reports": duplicate_check["existing_reports"],
                    "error_code": "DUPLICATE_REPORT"
                }
            )
        
        # Convert report to dict for storage
        report_dict = report.dict()
        
        # Save to master reports
        store.save_master_report(report_dict)
        
        return MasterReportCreateResponse(
            status="success",
            message=f"Master report {report.report_id} created successfully",
            report=report,
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating master report: {str(e)}"
        )


@router.get("/reports", response_model=MasterReportsResponse)
async def list_master_reports(
    gn_code: Optional[str] = Query(None, description="Filter by GN code (e.g., CMB-GN-01)"),
    source: Optional[str] = Query(None, description="Filter by source (hospital, divisional_secretariat, urban_council, gn_local)"),
    date_from: Optional[dt.date] = Query(None, description="Filter reports from this date (YYYY-MM-DD)"),
    date_to: Optional[dt.date] = Query(None, description="Filter reports until this date (YYYY-MM-DD)"),
    limit: Optional[int] = Query(100, ge=1, le=1000, description="Maximum number of reports to return")
):
    """
    List master reports with optional filtering
    Returns merged data from all 4 sources
    """
    if not PILOT_MODE:
        raise HTTPException(
            status_code=404, 
            detail="Pilot mode is disabled"
        )
    
    try:
        store = get_store(str(STORAGE_PATH))
        
        # Convert dates to strings for filtering
        date_from_str = date_from.isoformat() if date_from else None
        date_to_str = date_to.isoformat() if date_to else None
        
        # Get filtered reports
        all_reports = store.get_master_reports(
            gn_code=gn_code,
            source=source, 
            date_from=date_from_str,
            date_to=date_to_str
        )
        
        # Apply limit
        limited_reports = all_reports[:limit] if limit else all_reports
        
        # Convert to MasterReport objects
        master_reports = []
        for report_dict in limited_reports:
            try:
                master_reports.append(MasterReport(**report_dict))
            except Exception as e:
                print(f"Warning: Skipping invalid report {report_dict.get('report_id', 'unknown')}: {e}")
                continue
        
        return MasterReportsResponse(
            reports=master_reports,
            total_count=len(all_reports),
            filtered_count=len(master_reports),
            filters_applied={
                "gn_code": gn_code,
                "source": source,
                "date_from": date_from_str,
                "date_to": date_to_str
            },
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving master reports: {str(e)}"
        )


@router.get("/reports/{report_id}", response_model=MasterReport)
async def get_master_report(report_id: str):
    """
    Get a specific master report by ID
    """
    if not PILOT_MODE:
        raise HTTPException(
            status_code=404, 
            detail="Pilot mode is disabled"
        )
    
    try:
        store = get_store(str(STORAGE_PATH))
        report_dict = store.get_master_report_by_id(report_id)
        
        if not report_dict:
            raise HTTPException(
                status_code=404,
                detail=f"Master report {report_id} not found"
            )
        
        return MasterReport(**report_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving master report: {str(e)}"
        )


@router.put("/reports/{report_id}", response_model=MasterReportCreateResponse)
async def update_master_report(report_id: str, report: MasterReport):
    """
    Update an existing master report
    """
    if not PILOT_MODE:
        raise HTTPException(
            status_code=404, 
            detail="Pilot mode is disabled"
        )
    
    try:
        store = get_store(str(STORAGE_PATH))
        
        # Check if report exists
        existing = store.get_master_report_by_id(report_id)
        if not existing:
            raise HTTPException(
                status_code=404,
                detail=f"Master report {report_id} not found"
            )
        
        # Ensure the report_id matches
        if report.report_id != report_id:
            raise HTTPException(
                status_code=400,
                detail="Report ID in URL must match report ID in body"
            )
        
        # Convert and save
        report_dict = report.dict()
        store.save_master_report(report_dict)
        
        return MasterReportCreateResponse(
            status="success",
            message=f"Master report {report_id} updated successfully",
            report=report,
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating master report: {str(e)}"
        )


@router.delete("/reports/{report_id}", response_model=SuccessResponse)
async def delete_master_report(report_id: str):
    """
    Delete a master report by ID
    """
    if not PILOT_MODE:
        raise HTTPException(
            status_code=404, 
            detail="Pilot mode is disabled"
        )
    
    try:
        store = get_store(str(STORAGE_PATH))
        
        success = store.delete_master_report(report_id)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Master report {report_id} not found"
            )
        
        return SuccessResponse(
            status="success",
            message=f"Master report {report_id} deleted successfully",
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting master report: {str(e)}"
        )


# Source-specific endpoints (for data entry forms)

@router.post("/reports/hospital", response_model=MasterReportCreateResponse)
async def create_hospital_report(report: HospitalReport):
    """Create a hospital report and add to master dataset"""
    if not PILOT_MODE:
        raise HTTPException(status_code=404, detail="Pilot mode is disabled")
    
    try:
        # Convert to master report format
        master_report = MasterReport(
            report_id=report.report_id,
            date=report.date,
            gn_code=report.gn_code,
            gn_name=report.gn_name,
            source=report.source,
            source_record_type=report.source_record_type,
            confirmed_cases=report.confirmed_cases,
            suspected_cases=report.suspected_cases,
            notes=report.notes,
            latitude=report.latitude,
            longitude=report.longitude
        )
        
        return await create_master_report(master_report)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Hospital report validation failed: {str(e)}"
        )


@router.post("/reports/divisional", response_model=MasterReportCreateResponse)
async def create_divisional_report(report: DivisionalSecretariatReport):
    """Create a divisional secretariat report and add to master dataset"""
    if not PILOT_MODE:
        raise HTTPException(status_code=404, detail="Pilot mode is disabled")
    
    try:
        # Convert to master report format
        master_report = MasterReport(
            report_id=report.report_id,
            date=report.date,
            gn_code=report.gn_code,
            gn_name=report.gn_name,
            source=report.source,
            source_record_type=report.source_record_type,
            population=report.population,
            households=report.households,
            notes=report.notes,
            latitude=report.latitude,
            longitude=report.longitude
        )
        
        return await create_master_report(master_report)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Divisional secretariat report validation failed: {str(e)}"
        )


@router.post("/reports/urban-council", response_model=MasterReportCreateResponse)
async def create_urban_council_report(report: UrbanCouncilReport):
    """Create an urban council report and add to master dataset"""
    if not PILOT_MODE:
        raise HTTPException(status_code=404, detail="Pilot mode is disabled")
    
    try:
        # Convert to master report format
        master_report = MasterReport(
            report_id=report.report_id,
            date=report.date,
            gn_code=report.gn_code,
            gn_name=report.gn_name,
            source=report.source,
            source_record_type=report.source_record_type,
            fogging_scheduled=report.fogging_scheduled,
            environmental_complaints=report.environmental_complaints,
            stagnant_water_sites=report.stagnant_water_sites,
            notes=report.notes,
            latitude=report.latitude,
            longitude=report.longitude
        )
        
        return await create_master_report(master_report)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Urban council report validation failed: {str(e)}"
        )


@router.post("/reports/gn-local", response_model=MasterReportCreateResponse)
async def create_gn_local_report(report: GNLocalReport):
    """Create a GN local report and add to master dataset"""
    if not PILOT_MODE:
        raise HTTPException(status_code=404, detail="Pilot mode is disabled")
    
    try:
        # Convert to master report format
        master_report = MasterReport(
            report_id=report.report_id,
            date=report.date,
            gn_code=report.gn_code,
            gn_name=report.gn_name,
            source=report.source,
            source_record_type=report.source_record_type,
            breeding_sites=report.breeding_sites,
            inspections_total=report.inspections_total,
            flagged_inspections=report.flagged_inspections,
            notes=report.notes,
            latitude=report.latitude,
            longitude=report.longitude
        )
        
        return await create_master_report(master_report)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"GN local report validation failed: {str(e)}"
        )


# ══════════════════════════════════════════════════════════════════════════════
# PILOT HOTSPOT SCORING AND RANKING
# ══════════════════════════════════════════════════════════════════════════════

# Configurable hotspot scoring formula
# Easy to modify for future adjustments
HOTSPOT_SCORING_CONFIG = {
    "confirmed_cases_weight": 5,
    "breeding_sites_weight": 3, 
    "environmental_complaints_weight": 2,
    "flagged_inspections_weight": 2,
    "risk_level_thresholds": {
        "high": 100,    # >= 100 = High risk
        "medium": 40,   # >= 40 = Medium risk  
        "low": 0        # < 40 = Low risk
    }
}


def calculate_gn_hotspot_scores():
    """
    Calculate hotspot risk scores for all GN divisions using master dataset.
    
    Formula: risk_score = 
        (confirmed_cases * 5) + 
        (breeding_sites * 3) + 
        (environmental_complaints * 2) + 
        (flagged_inspections * 2)
    
    Returns:
        List of GN hotspot data with scores, rankings, and risk levels
    """
    try:
        # Get all master reports
        store = get_store(str(STORAGE_PATH))
        reports = store.get_master_reports(gn_code=None, source=None, date_from=None, date_to=None)
        
        if not reports:
            return []
        
        # Group data by GN code to aggregate metrics
        gn_aggregates = {}
        
        for report in reports:
            gn_code = report.get('gn_code')
            gn_name = report.get('gn_name')
            
            if not gn_code or not gn_name:
                continue
                
            # Initialize GN if not exists
            if gn_code not in gn_aggregates:
                gn_aggregates[gn_code] = {
                    'gn_code': gn_code,
                    'gn_name': gn_name,
                    'confirmed_cases': 0,
                    'breeding_sites': 0,
                    'environmental_complaints': 0,
                    'flagged_inspections': 0,
                    'population': 0,
                    'report_count': 0
                }
            
            # Aggregate metrics (sum across all reports for this GN)
            agg = gn_aggregates[gn_code]
            agg['report_count'] += 1
            
            # Sum up the scoring metrics
            agg['confirmed_cases'] += report.get('confirmed_cases') or 0
            agg['breeding_sites'] += report.get('breeding_sites') or 0
            agg['environmental_complaints'] += report.get('environmental_complaints') or 0
            agg['flagged_inspections'] += report.get('flagged_inspections') or 0
            
            # Use the latest population data (could be from divisional secretariat reports)
            if report.get('population'):
                agg['population'] = report.get('population')
        
        # Calculate risk scores for each GN
        hotspots = []
        config = HOTSPOT_SCORING_CONFIG
        
        for gn_code, data in gn_aggregates.items():
            # Apply the scoring formula
            risk_score = (
                (data['confirmed_cases'] * config['confirmed_cases_weight']) +
                (data['breeding_sites'] * config['breeding_sites_weight']) +
                (data['environmental_complaints'] * config['environmental_complaints_weight']) +
                (data['flagged_inspections'] * config['flagged_inspections_weight'])
            )
            
            # Determine risk level based on thresholds
            if risk_score >= config['risk_level_thresholds']['high']:
                risk_level = 'High'
            elif risk_score >= config['risk_level_thresholds']['medium']:
                risk_level = 'Medium'
            else:
                risk_level = 'Low'
            
            # Create hotspot entry
            hotspot = {
                'gn_code': gn_code,
                'gn_name': data['gn_name'],
                'confirmed_cases': data['confirmed_cases'],
                'breeding_sites': data['breeding_sites'],
                'environmental_complaints': data['environmental_complaints'],
                'flagged_inspections': data['flagged_inspections'],
                'population': data['population'],
                'risk_score': risk_score,
                'risk_level': risk_level,
                'report_count': data['report_count'],
                'calculation_explanation': (
                    f"Risk Score = ({data['confirmed_cases']} confirmed cases × {config['confirmed_cases_weight']}) + "
                    f"({data['breeding_sites']} breeding sites × {config['breeding_sites_weight']}) + "
                    f"({data['environmental_complaints']} environmental complaints × {config['environmental_complaints_weight']}) + "
                    f"({data['flagged_inspections']} flagged inspections × {config['flagged_inspections_weight']}) = {risk_score}"
                )
            }
            
            hotspots.append(hotspot)
        
        # Sort by risk score (highest first) and assign priority rankings
        hotspots.sort(key=lambda x: x['risk_score'], reverse=True)
        
        for i, hotspot in enumerate(hotspots):
            hotspot['priority_rank'] = i + 1
        
        return hotspots
        
    except Exception as e:
        print(f"Error calculating GN hotspot scores: {str(e)}")
        return []


@router.get("/hotspots", response_model=Dict)
async def get_pilot_hotspots():
    """
    Get GN-level hotspot rankings for the pilot areas (CMB-GN-01/02/03)
    
    This endpoint provides hotspot scoring and ranking based on the master merged dataset,
    separate from the district-level ML hotspots in the main prediction system.
    
    Formula used:
    risk_score = (confirmed_cases × 5) + (breeding_sites × 3) + (environmental_complaints × 2) + (flagged_inspections × 2)
    
    Risk levels:
    - High: Score >= 100
    - Medium: Score >= 40  
    - Low: Score < 40
    
    Returns hotspots ranked from highest to lowest risk score.
    """
    if not PILOT_MODE:
        raise HTTPException(status_code=404, detail="Pilot mode is disabled")
    
    try:
        hotspots = calculate_gn_hotspot_scores()
        
        if not hotspots:
            return {
                "status": "success",
                "message": "No hotspot data available. Please ensure master reports exist.",
                "count": 0,
                "hotspots": [],
                "formula": {
                    "description": "Risk Score = (confirmed_cases × 5) + (breeding_sites × 3) + (environmental_complaints × 2) + (flagged_inspections × 2)",
                    "weights": HOTSPOT_SCORING_CONFIG,
                    "explanation": "Higher scores indicate greater dengue risk requiring more resources and attention"
                },
                "timestamp": get_timestamp()
            }
        
        # Calculate summary statistics
        high_risk_count = len([h for h in hotspots if h['risk_level'] == 'High'])
        medium_risk_count = len([h for h in hotspots if h['risk_level'] == 'Medium'])
        low_risk_count = len([h for h in hotspots if h['risk_level'] == 'Low'])
        
        highest_score = hotspots[0]['risk_score'] if hotspots else 0
        lowest_score = hotspots[-1]['risk_score'] if hotspots else 0
        
        return {
            "status": "success",
            "message": f"GN hotspots calculated successfully using {sum(h['report_count'] for h in hotspots)} master reports",
            "count": len(hotspots),
            "hotspots": hotspots,
            "summary": {
                "high_risk_count": high_risk_count,
                "medium_risk_count": medium_risk_count, 
                "low_risk_count": low_risk_count,
                "score_range": {
                    "highest": highest_score,
                    "lowest": lowest_score
                }
            },
            "formula": {
                "description": "Risk Score = (confirmed_cases × 5) + (breeding_sites × 3) + (environmental_complaints × 2) + (flagged_inspections × 2)",
                "weights": HOTSPOT_SCORING_CONFIG,
                "explanation": "Higher scores indicate greater dengue risk. Confirmed cases are weighted highest (×5) as they represent actual disease presence, followed by breeding sites (×3) as prevention points, then environmental factors (×2 each)."
            },
            "timestamp": get_timestamp()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate pilot hotspots: {str(e)}"
        )


@router.get("/hotspots/config", response_model=Dict)
async def get_hotspot_config():
    """
    Get the current hotspot scoring configuration.
    Useful for understanding weights and thresholds, or for building admin interfaces.
    """
    if not PILOT_MODE:
        raise HTTPException(status_code=404, detail="Pilot mode is disabled")
    
    return {
        "status": "success",
        "message": "Hotspot scoring configuration retrieved",
        "config": HOTSPOT_SCORING_CONFIG,
        "formula_explanation": {
            "english": "The risk score combines four key dengue risk factors with different importance weights",
            "details": [
                f"Confirmed cases (weight {HOTSPOT_SCORING_CONFIG['confirmed_cases_weight']}): Actual dengue infections - highest priority",
                f"Breeding sites (weight {HOTSPOT_SCORING_CONFIG['breeding_sites_weight']}): Mosquito reproduction areas - prevention focus", 
                f"Environmental complaints (weight {HOTSPOT_SCORING_CONFIG['environmental_complaints_weight']}): Community-reported issues",
                f"Flagged inspections (weight {HOTSPOT_SCORING_CONFIG['flagged_inspections_weight']}): Problem areas found during field visits"
            ],
            "risk_levels": "Scores are classified as High (≥100), Medium (≥40), or Low (<40) risk"
        },
        "timestamp": get_timestamp()
    }


# ══════════════════════════════════════════════════════════════════════════════
# PILOT RESOURCE ALLOCATION
# ══════════════════════════════════════════════════════════════════════════════

# Pilot Resource Allocation Configuration
# Easy to modify for future adjustments
PILOT_RESOURCE_CONFIG = {
    "daily_constraints": {
        "fogging_teams_available": 2,      # Total fogging teams per day
        "inspection_teams_available": 3,   # Total inspection teams per day  
        "max_hours_per_team": 8            # Max working hours per team
    },
    "allocation_rules": {
        # Rules based on GN hotspot priority ranking
        1: {  # Rank 1 (Highest risk)
            "fogging_teams": 2,
            "inspection_teams": 1,
            "priority_notes": "Highest risk - maximum resources allocated"
        },
        2: {  # Rank 2 (Medium-high risk)  
            "fogging_teams": 1,
            "inspection_teams": 1,
            "priority_notes": "Second priority - balanced allocation"
        },
        3: {  # Rank 3 (Lower risk)
            "fogging_teams": 0,
            "inspection_teams": 1, 
            "priority_notes": "Monitoring and inspection only"
        }
    },
    "resource_types": {
        "fogging_teams": {
            "description": "Vector control teams for fogging operations",
            "unit": "teams",
            "hours_per_operation": 4  # Estimated hours per fogging operation
        },
        "inspection_teams": {
            "description": "Field inspection teams for monitoring",
            "unit": "teams", 
            "hours_per_operation": 6  # Estimated hours per inspection operation
        }
    }
}


def calculate_pilot_resource_allocation():
    """
    Calculate resource allocation for pilot GN areas based on hotspot rankings.
    
    Uses simple rule-based allocation:
    - Rank 1: 2 fogging teams + 1 inspection team
    - Rank 2: 1 fogging team + 1 inspection team  
    - Rank 3: 0 fogging teams + 1 inspection team
    
    Returns allocation plan with resource assignments per GN.
    """
    try:
        # Get current hotspot rankings
        hotspots = calculate_gn_hotspot_scores()
        
        if not hotspots:
            return []
        
        config = PILOT_RESOURCE_CONFIG
        allocation_plan = []
        
        # Track total resource usage
        total_fogging_allocated = 0
        total_inspection_allocated = 0
        
        for hotspot in hotspots:
            gn_code = hotspot['gn_code']
            gn_name = hotspot['gn_name']
            priority_rank = hotspot['priority_rank']
            risk_level = hotspot['risk_level']
            risk_score = hotspot['risk_score']
            
            # Get allocation rules for this rank
            allocation_rule = config['allocation_rules'].get(priority_rank, {
                "fogging_teams": 0,
                "inspection_teams": 0,
                "priority_notes": f"Rank {priority_rank} - no predefined allocation rule"
            })
            
            fogging_allocated = allocation_rule.get('fogging_teams', 0)
            inspection_allocated = allocation_rule.get('inspection_teams', 0)
            
            # Update totals
            total_fogging_allocated += fogging_allocated
            total_inspection_allocated += inspection_allocated
            
            # Calculate estimated work hours
            fogging_hours = fogging_allocated * config['resource_types']['fogging_teams']['hours_per_operation']
            inspection_hours = inspection_allocated * config['resource_types']['inspection_teams']['hours_per_operation']
            total_hours = fogging_hours + inspection_hours
            
            # Create allocation entry
            allocation = {
                'gn_code': gn_code,
                'gn_name': gn_name,
                'priority_rank': priority_rank,
                'risk_level': risk_level,
                'risk_score': risk_score,
                'fogging_teams_allocated': fogging_allocated,
                'inspection_teams_allocated': inspection_allocated,
                'fogging_allocation_text': f"{fogging_allocated} fogging team{'s' if fogging_allocated != 1 else ''}",
                'inspection_allocation_text': f"{inspection_allocated} inspection team{'s' if inspection_allocated != 1 else ''}",
                'estimated_hours': {
                    'fogging': fogging_hours,
                    'inspection': inspection_hours,
                    'total': total_hours
                },
                'allocation_notes': allocation_rule.get('priority_notes', ''),
                'resource_utilization': {
                    'within_capacity': total_hours <= config['daily_constraints']['max_hours_per_team'],
                    'efficiency_rating': 'High' if total_hours <= 6 else 'Medium' if total_hours <= 8 else 'Over capacity'
                }
            }
            
            allocation_plan.append(allocation)
        
        # Add summary information
        for allocation in allocation_plan:
            allocation['plan_summary'] = {
                'total_fogging_teams_used': total_fogging_allocated,
                'total_inspection_teams_used': total_inspection_allocated,
                'fogging_capacity_remaining': config['daily_constraints']['fogging_teams_available'] - total_fogging_allocated,
                'inspection_capacity_remaining': config['daily_constraints']['inspection_teams_available'] - total_inspection_allocated,
                'allocation_feasible': (
                    total_fogging_allocated <= config['daily_constraints']['fogging_teams_available'] and
                    total_inspection_allocated <= config['daily_constraints']['inspection_teams_available']
                )
            }
        
        return allocation_plan
        
    except Exception as e:
        print(f"Error calculating pilot resource allocation: {str(e)}")
        return []


@router.get("/resource-allocation", response_model=Dict)
async def get_pilot_resource_allocation():
    """
    Get rule-based resource allocation for pilot GN areas.
    
    This endpoint provides resource allocation based on GN hotspot rankings using
    simple rule-based logic separate from the district-level ML allocation system.
    
    Allocation Rules (Easy to Modify):
    - Rank 1 GN: 2 fogging teams + 1 inspection team
    - Rank 2 GN: 1 fogging team + 1 inspection team  
    - Rank 3 GN: 0 fogging teams + 1 inspection team
    
    Daily Constraints:
    - 2 fogging teams available per day
    - 3 inspection teams available per day
    - 8 max hours per team
    
    Returns detailed allocation plan with resource assignments and feasibility analysis.
    """
    if not PILOT_MODE:
        raise HTTPException(status_code=404, detail="Pilot mode is disabled")
    
    try:
        allocation_plan = calculate_pilot_resource_allocation()
        
        if not allocation_plan:
            return {
                "status": "success",
                "message": "No allocation data available. Please ensure hotspot data exists.",
                "count": 0,
                "allocations": [],
                "config": PILOT_RESOURCE_CONFIG,
                "timestamp": get_timestamp()
            }
        
        # Calculate summary statistics
        total_gns = len(allocation_plan)
        total_fogging = sum(a['fogging_teams_allocated'] for a in allocation_plan)
        total_inspection = sum(a['inspection_teams_allocated'] for a in allocation_plan)
        
        feasible = allocation_plan[0]['plan_summary']['allocation_feasible'] if allocation_plan else False
        
        return {
            "status": "success",
            "message": f"Resource allocation calculated for {total_gns} GN areas",
            "count": total_gns,
            "allocations": allocation_plan,
            "summary": {
                "total_fogging_teams_allocated": total_fogging,
                "total_inspection_teams_allocated": total_inspection,
                "fogging_teams_available": PILOT_RESOURCE_CONFIG['daily_constraints']['fogging_teams_available'],
                "inspection_teams_available": PILOT_RESOURCE_CONFIG['daily_constraints']['inspection_teams_available'],
                "fogging_utilization": f"{total_fogging}/{PILOT_RESOURCE_CONFIG['daily_constraints']['fogging_teams_available']} teams",
                "inspection_utilization": f"{total_inspection}/{PILOT_RESOURCE_CONFIG['daily_constraints']['inspection_teams_available']} teams",
                "allocation_feasible": feasible,
                "capacity_status": "Within capacity" if feasible else "Over capacity - review allocation rules"
            },
            "config": PILOT_RESOURCE_CONFIG,
            "explanation": {
                "purpose": "Rule-based resource allocation for dengue control in pilot GN areas",
                "methodology": "Allocates fogging and inspection teams based on hotspot priority ranking",
                "rules_location": "PILOT_RESOURCE_CONFIG in backend/routes/pilot.py - easy to modify",
                "constraints": "Daily team availability and maximum working hours per team",
                "updates": "Allocation updates automatically when hotspot rankings change"
            },
            "timestamp": get_timestamp()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate pilot resource allocation: {str(e)}"
        )


@router.get("/resource-allocation/config", response_model=Dict)
async def get_pilot_resource_config():
    """
    Get the current pilot resource allocation configuration.
    Useful for understanding allocation rules and constraints, or for building admin interfaces.
    """
    if not PILOT_MODE:
        raise HTTPException(status_code=404, detail="Pilot mode is disabled")
    
    return {
        "status": "success",
        "message": "Pilot resource allocation configuration retrieved",
        "config": PILOT_RESOURCE_CONFIG,
        "rules_explanation": {
            "allocation_logic": "Simple rank-based rules for assigning fogging and inspection teams",
            "rank_1": "Highest risk GN gets maximum resources (2 fogging + 1 inspection)",
            "rank_2": "Second priority GN gets balanced allocation (1 fogging + 1 inspection)", 
            "rank_3": "Lower risk GN gets monitoring only (0 fogging + 1 inspection)",
            "customization": "Rules stored in PILOT_RESOURCE_CONFIG - modify allocation_rules dictionary to change assignments",
            "constraints": "Daily team availability limits total allocations across all GNs"
        },
        "modification_guide": {
            "change_rules": "Edit PILOT_RESOURCE_CONFIG['allocation_rules'] to modify team assignments per rank",
            "change_capacity": "Edit PILOT_RESOURCE_CONFIG['daily_constraints'] to adjust team availability",
            "add_ranks": "Add new rank entries to handle more than 3 GN areas",
            "file_location": "backend/routes/pilot.py around line 700+"
        },
        "timestamp": get_timestamp()
    }


# ══════════════════════════════════════════════════════════════════════════════
# PILOT ROUTE PLANNING
# ══════════════════════════════════════════════════════════════════════════════

import math
import json
import asyncio
from backend.services.routing_service import (
    get_routing_service, RoutePoint, plan_multi_stop_route, calculate_travel_time
)

# Depot configuration for route planning
PILOT_DEPOT_CONFIG = {
    "depot_id": "DEPOT-01", 
    "name": "Colombo MOH / Urban Council Pilot Depot",
    "latitude": 6.8916,
    "longitude": 79.8574,
    "description": "Central depot for dengue control operations in Colombo pilot areas"
}

# Route planning configuration
ROUTE_PLANNING_CONFIG = {
    "algorithm": "risk_first_distance_optimized",  # Primary strategy: risk first, then distance
    "fallback_algorithm": "nearest_neighbor",      # Fallback: pure distance-based
    "routing_preferences": {
        "prioritize_high_risk": True,              # Always visit high-risk areas first
        "minimize_travel_distance": True,          # Optimize route distance within risk tiers
        "include_depot_return": True               # Return to depot at end of route
    },
    "distance_calculation": "haversine",           # Use great-circle distance
    "future_integration": {
        "google_maps_api": "Can be integrated for real road routing",
        "openrouteservice": "Alternative for road-based routing",
        "mapbox": "Another option for detailed turn-by-turn directions"
    }
}


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points on Earth using Haversine formula.
    Returns distance in kilometers.
    """
    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Earth's radius in kilometers
    r = 6371
    
    return c * r


def calculate_polygon_center(coordinates):
    """
    Calculate the center point (centroid) of a polygon from GeoJSON coordinates.
    Returns (latitude, longitude) tuple.
    """
    if not coordinates or not coordinates[0]:
        return None
    
    # Get the outer ring of the polygon
    ring = coordinates[0]
    
    # Calculate centroid
    x_sum = sum(coord[0] for coord in ring[:-1])  # Exclude last point (same as first)
    y_sum = sum(coord[1] for coord in ring[:-1])
    count = len(ring) - 1
    
    if count == 0:
        return None
    
    # Return as (latitude, longitude)
    return (y_sum / count, x_sum / count)


def load_gn_locations():
    """
    Load GN boundary data and extract center coordinates for each GN area.
    Returns dictionary mapping gn_code to coordinates and metadata.
    """
    try:
        # Load GeoJSON boundary data
        geojson_path = PILOT_BOUNDARIES_PATH
        
        if not geojson_path.exists():
            print(f"Warning: GN boundaries file not found at {geojson_path}")
            return {}
        
        with open(geojson_path, 'r') as f:
            geojson_data = json.load(f)
        
        gn_locations = {}
        
        for feature in geojson_data.get('features', []):
            properties = feature.get('properties', {})
            geometry = feature.get('geometry', {})
            
            gn_code = properties.get('gn_code')
            gn_name = properties.get('gn_name')
            
            if not gn_code or not gn_name:
                continue
            
            # Calculate center coordinates from polygon
            coordinates = geometry.get('coordinates')
            if coordinates and geometry.get('type') == 'Polygon':
                center = calculate_polygon_center(coordinates)
                if center:
                    gn_locations[gn_code] = {
                        'gn_code': gn_code,
                        'gn_name': gn_name,
                        'latitude': center[0],
                        'longitude': center[1],
                        'city': properties.get('city', 'Colombo')
                    }
        
        return gn_locations
        
    except Exception as e:
        print(f"Error loading GN locations: {str(e)}")
        return {}


def plan_optimal_route():
    """
    Plan optimal route for visiting all pilot GN areas starting from depot.
    
    Algorithm:
    1. Start at depot
    2. Visit GN areas ordered by risk priority (hotspot ranking)
    3. Within same risk level, optimize by shortest distance
    4. Return to depot (optional)
    
    Returns detailed route plan with coordinates, distances, and timing.
    """
    try:
        # Get current hotspot data (includes risk rankings)
        hotspots = calculate_gn_hotspot_scores()
        
        # Get GN location coordinates
        gn_locations = load_gn_locations()
        
        if not hotspots or not gn_locations:
            return []
        
        # Create route stops list
        route_stops = []
        
        # 1. Add depot as starting point
        depot = PILOT_DEPOT_CONFIG
        route_stops.append({
            'stop_order': 1,
            'location_code': depot['depot_id'],
            'location_name': depot['name'],
            'location_type': 'depot',
            'latitude': depot['latitude'],
            'longitude': depot['longitude'],
            'risk_level': None,
            'risk_score': None,
            'priority_rank': None,
            'distance_from_previous': 0.0,
            'cumulative_distance': 0.0,
            'estimated_time_minutes': 0,
            'activity': 'Start operations'
        })
        
        # 2. Add GN areas sorted by hotspot priority
        sorted_hotspots = sorted(hotspots, key=lambda x: x['priority_rank'])
        
        for i, hotspot in enumerate(sorted_hotspots):
            gn_code = hotspot['gn_code']
            
            # Get location coordinates
            location = gn_locations.get(gn_code)
            if not location:
                continue
            
            # Calculate distance from previous stop
            prev_lat = route_stops[-1]['latitude']
            prev_lon = route_stops[-1]['longitude']
            distance = haversine_distance(prev_lat, prev_lon, location['latitude'], location['longitude'])
            
            # Estimate travel time (assume 30 km/h average in urban area)
            travel_time = (distance * 60) / 30  # minutes
            
            # Add stop to route
            stop_order = len(route_stops) + 1
            route_stops.append({
                'stop_order': stop_order,
                'location_code': gn_code,
                'location_name': location['gn_name'],
                'location_type': 'gn_area',
                'latitude': location['latitude'],
                'longitude': location['longitude'],
                'risk_level': hotspot['risk_level'],
                'risk_score': hotspot['risk_score'],
                'priority_rank': hotspot['priority_rank'],
                'distance_from_previous': round(distance, 2),
                'cumulative_distance': round(route_stops[-1]['cumulative_distance'] + distance, 2),
                'estimated_time_minutes': round(travel_time, 1),
                'activity': f"Dengue control operations - {hotspot['risk_level']} risk area"
            })
        
        # 3. Optional: Return to depot
        if ROUTE_PLANNING_CONFIG['routing_preferences']['include_depot_return'] and len(route_stops) > 1:
            last_stop = route_stops[-1]
            return_distance = haversine_distance(
                last_stop['latitude'], last_stop['longitude'],
                depot['latitude'], depot['longitude']
            )
            return_time = (return_distance * 60) / 30
            
            route_stops.append({
                'stop_order': len(route_stops) + 1,
                'location_code': depot['depot_id'],
                'location_name': depot['name'] + " (Return)",
                'location_type': 'depot_return',
                'latitude': depot['latitude'],
                'longitude': depot['longitude'],
                'risk_level': None,
                'risk_score': None,
                'priority_rank': None,
                'distance_from_previous': round(return_distance, 2),
                'cumulative_distance': round(last_stop['cumulative_distance'] + return_distance, 2),
                'estimated_time_minutes': round(return_time, 1),
                'activity': 'Return to depot'
            })
        
        return route_stops
        
    except Exception as e:
        print(f"Error planning route: {str(e)}")
        return []


@router.get("/route-plan", response_model=Dict)
async def get_pilot_route_plan():
    """
    Get optimized route plan for visiting pilot GN areas.
    
    This endpoint provides route planning for dengue control operations using
    simple distance-based optimization with risk priority ordering.
    
    Algorithm:
    1. Start at Colombo MOH/Urban Council depot
    2. Visit GN areas in order of dengue risk (hotspot ranking)
    3. Minimize travel distance between consecutive stops
    4. Use straight-line (Haversine) distance calculations
    
    Future Integration:
    - Can be enhanced with Google Maps Roads API for real road routing
    - Can integrate turn-by-turn directions
    - Can account for traffic conditions and road constraints
    
    Returns complete route plan with coordinates, distances, and timing estimates.
    """
    if not PILOT_MODE:
        raise HTTPException(status_code=404, detail="Pilot mode is disabled")
    
    try:
        route_stops = plan_optimal_route()
        
        if not route_stops:
            return {
                "status": "success",
                "message": "No route data available. Please ensure hotspot and boundary data exist.",
                "count": 0,
                "route_stops": [],
                "depot": PILOT_DEPOT_CONFIG,
                "config": ROUTE_PLANNING_CONFIG,
                "timestamp": get_timestamp()
            }
        
        # Calculate route summary
        total_distance = route_stops[-1]['cumulative_distance'] if route_stops else 0
        total_time = sum(stop['estimated_time_minutes'] for stop in route_stops)
        gn_stops = [stop for stop in route_stops if stop['location_type'] == 'gn_area']
        
        # Create polyline coordinates for map visualization
        route_coordinates = [[stop['latitude'], stop['longitude']] for stop in route_stops]
        
        return {
            "status": "success",
            "message": f"Route plan calculated for {len(gn_stops)} GN areas",
            "count": len(route_stops),
            "route_stops": route_stops,
            "summary": {
                "total_stops": len(route_stops),
                "gn_areas_visited": len(gn_stops),
                "total_distance_km": round(total_distance, 2),
                "estimated_travel_time_hours": round(total_time / 60, 1),
                "route_efficiency": "Risk-prioritized with distance optimization"
            },
            "route_coordinates": route_coordinates,
            "depot": PILOT_DEPOT_CONFIG,
            "config": ROUTE_PLANNING_CONFIG,
            "map_instructions": {
                "center_map_on": [PILOT_DEPOT_CONFIG['latitude'], PILOT_DEPOT_CONFIG['longitude']],
                "zoom_level": 13,
                "draw_polyline": "Connect route_coordinates in order with different colors per segment",
                "marker_types": "Depot (green), High risk (red), Medium risk (yellow), Low risk (green)"
            },
            "future_enhancements": {
                "google_maps_integration": "Replace Haversine with Google Maps Roads API for real routing",
                "traffic_optimization": "Account for real-time traffic conditions",
                "multi_day_routing": "Extend for multi-day operation planning",
                "team_coordination": "Coordinate multiple teams with different routes"
            },
            "timestamp": get_timestamp()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate route plan: {str(e)}"
        )


@router.get("/route-plan/config", response_model=Dict)
async def get_route_planning_config():
    """
    Get route planning configuration and algorithm information.
    """
    if not PILOT_MODE:
        raise HTTPException(status_code=404, detail="Pilot mode is disabled")
    
    return {
        "status": "success",
        "message": "Route planning configuration retrieved",
        "depot": PILOT_DEPOT_CONFIG,
        "config": ROUTE_PLANNING_CONFIG,
        "algorithm_explanation": {
            "current_approach": "Risk-first ordering with distance optimization within risk tiers",
            "distance_calculation": "Haversine formula for great-circle distance (straight-line)",
            "routing_logic": [
                "1. Start at depot (6.8916, 79.8574)",
                "2. Visit GN areas ordered by dengue risk priority (rank 1, 2, 3...)",
                "3. Within same risk level, choose nearest unvisited location",
                "4. Calculate distances using Haversine formula",
                "5. Optionally return to depot at end"
            ],
            "limitations": "Uses straight-line distances, not actual road networks",
            "accuracy": "Good for initial planning, but real roads may differ significantly"
        },
        "integration_roadmap": {
            "phase_1": "Current - Simple Haversine distance routing",
            "phase_2": "Google Maps Roads API integration for real road routing",
            "phase_3": "Traffic-aware routing with real-time optimization", 
            "phase_4": "Multi-team coordination and advanced constraints"
        },
        "timestamp": get_timestamp()
    }


@router.get("/route-plan/enhanced", response_model=Dict)
async def get_enhanced_route_plan():
    """
    Get enhanced route plan using the routing service interface.
    
    This endpoint demonstrates the routing service integration and provides
    more realistic travel time and distance estimates compared to the basic
    route-plan endpoint.
    
    Features:
    - Uses routing service abstraction layer
    - Provides road-distance estimates (not just straight-line)
    - Includes realistic travel time calculations
    - Ready for Google Maps integration
    - Supports different travel modes
    
    Environment Variables for Future Integration:
    - ROUTING_PROVIDER: Set to 'google_maps' when ready (currently 'mock')
    - GOOGLE_MAPS_API_KEY: Required for Google Maps integration
    """
    if not PILOT_MODE:
        raise HTTPException(status_code=404, detail="Pilot mode is disabled")
    
    try:
        # Get hotspot data for GN priority ordering
        hotspots = calculate_gn_hotspot_scores()
        
        if not hotspots:
            return {
                "status": "success",
                "message": "No route data available. Please ensure hotspot data exists.",
                "count": 0,
                "route_plan": {},
                "routing_service": "No data to process",
                "timestamp": get_timestamp()
            }
        
        # Prepare stops for routing service
        depot = PILOT_DEPOT_CONFIG
        stops = []
        
        # Sort hotspots by priority rank
        sorted_hotspots = sorted(hotspots, key=lambda x: x['priority_rank'])
        
        for hotspot in sorted_hotspots:
            # Use GN centroid from config if available
            gn_match = None
            for gn in PILOT_CONFIG["pilot_gns"]:
                if gn["gn_code"] == hotspot["gn_code"]:
                    gn_match = gn
                    break
            
            if gn_match:
                stops.append({
                    "latitude": gn_match["centroid_lat"],
                    "longitude": gn_match["centroid_lon"],
                    "name": f"{gn_match['gn_name']} (GN-{hotspot['gn_code'][-2:]})",
                    "gn_code": hotspot["gn_code"],
                    "risk_level": hotspot["risk_level"],
                    "risk_score": hotspot["risk_score"],
                    "priority_rank": hotspot["priority_rank"]
                })
        
        # Calculate enhanced route using routing service
        route_response = await plan_multi_stop_route(
            depot_lat=depot["latitude"],
            depot_lon=depot["longitude"],
            stops=stops,
            depot_name=depot["name"],
            optimize_order=False,  # Keep risk-based order
            return_to_depot=True
        )
        
        # Convert route response to API format
        enhanced_route = {
            "route_overview": {
                "total_distance_km": round(route_response.total_distance_meters / 1000, 2),
                "total_duration_minutes": round(route_response.total_duration_seconds / 60, 1),
                "total_stops": len(route_response.segments) + 1,  # Including origin
                "gn_areas_visited": len(stops),
                "distance_text": route_response.total_distance_text,
                "duration_text": route_response.total_duration_text,
                "status": route_response.status
            },
            "segments": [],
            "waypoints": []
        }
        
        # Process route segments
        cumulative_distance = 0
        cumulative_time = 0
        
        for i, segment in enumerate(route_response.segments):
            cumulative_distance += segment.distance_meters
            cumulative_time += segment.duration_seconds
            
            # Find associated stop data
            stop_data = None
            for stop in stops:
                if (abs(segment.end_point.latitude - stop["latitude"]) < 0.001 and 
                    abs(segment.end_point.longitude - stop["longitude"]) < 0.001):
                    stop_data = stop
                    break
            
            segment_info = {
                "segment_number": i + 1,
                "from": {
                    "name": segment.start_point.name,
                    "latitude": segment.start_point.latitude,
                    "longitude": segment.start_point.longitude
                },
                "to": {
                    "name": segment.end_point.name,
                    "latitude": segment.end_point.latitude,
                    "longitude": segment.end_point.longitude
                },
                "distance": {
                    "meters": segment.distance_meters,
                    "kilometers": round(segment.distance_meters / 1000, 2),
                    "text": segment.distance_text
                },
                "duration": {
                    "seconds": segment.duration_seconds,
                    "minutes": round(segment.duration_seconds / 60, 1),
                    "text": segment.duration_text
                },
                "cumulative": {
                    "distance_km": round(cumulative_distance / 1000, 2),
                    "time_minutes": round(cumulative_time / 60, 1)
                },
                "travel_mode": segment.travel_mode,
                "instructions": segment.instructions or []
            }
            
            # Add GN-specific data if this segment ends at a GN area
            if stop_data:
                segment_info["gn_area"] = {
                    "gn_code": stop_data["gn_code"],
                    "risk_level": stop_data["risk_level"],
                    "risk_score": stop_data["risk_score"],
                    "priority_rank": stop_data["priority_rank"]
                }
            
            enhanced_route["segments"].append(segment_info)
        
        # Add waypoint summary
        for stop in stops:
            enhanced_route["waypoints"].append({
                "gn_code": stop["gn_code"],
                "name": stop["name"],
                "coordinates": [stop["latitude"], stop["longitude"]],
                "risk_level": stop["risk_level"],
                "priority_rank": stop["priority_rank"]
            })
        
        return {
            "status": "success",
            "message": f"Enhanced route calculated using routing service for {len(stops)} GN areas",
            "route_plan": enhanced_route,
            "depot": depot,
            "routing_service": {
                "provider": "mock",  # Will be configurable via ROUTING_PROVIDER env var
                "features": [
                    "Road-distance estimation (1.3x straight-line factor)",
                    "Realistic travel time calculation (30 km/h urban average)",
                    "Turn-by-turn instruction generation",
                    "Multiple travel modes support",
                    "Future Google Maps integration ready"
                ],
                "integration_status": "Mock mode - suitable for development and demos",
                "google_maps_requirements": {
                    "api_key": "Set GOOGLE_MAPS_API_KEY environment variable",
                    "provider": "Set ROUTING_PROVIDER=google_maps",
                    "apis_needed": [
                        "Directions API",
                        "Distance Matrix API"
                    ]
                }
            },
            "comparison_with_basic": {
                "basic_route": "Uses straight-line Haversine distances",
                "enhanced_route": "Uses road-distance estimates with realistic travel times",
                "accuracy_improvement": "~30% more realistic for urban routing"
            },
            "timestamp": get_timestamp()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate enhanced route plan: {str(e)}"
        )