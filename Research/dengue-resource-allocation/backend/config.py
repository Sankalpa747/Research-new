"""
Configuration Module
Central configuration for the backend API
"""

import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
ML_DIR = BASE_DIR / "ml"

# Data files
PROCESSED_DATA_PATH = DATA_DIR / "processed_data.csv"
STORAGE_PATH = DATA_DIR / "storage.json"

# Model files
RISK_MODEL_PATH = MODELS_DIR / "risk_model.pkl"
RESOURCE_MODEL_PATH = MODELS_DIR / "resource_model.pkl"
ALLOCATION_MODEL_PATH = ML_DIR / "resource_allocation_model.pkl"

# District population and house data for Sri Lanka (25 districts)
DISTRICT_DATA = {
    "Ampara":        {"population": 649738,  "houses": 146000},
    "Anuradhapura":  {"population": 856232,  "houses": 205000},
    "Badulla":       {"population": 812379,  "houses": 195000},
    "Batticaloa":    {"population": 526567,  "houses": 115000},
    "Colombo":       {"population": 2323826, "houses": 520000},
    "Galle":         {"population": 1063407, "houses": 250000},
    "Gampaha":       {"population": 2304833, "houses": 490000},
    "Hambantota":    {"population": 599903,  "houses": 140000},
    "Jaffna":        {"population": 583882,  "houses": 130000},
    "Kalutara":      {"population": 1221948, "houses": 290000},
    "Kandy":         {"population": 1375382, "houses": 330000},
    "Kegalle":       {"population": 841764,  "houses": 202000},
    "Kilinochchi":   {"population": 116414,  "houses": 26000},
    "Kurunegala":    {"population": 1618465, "houses": 380000},
    "Mannar":        {"population": 99051,   "houses": 22000},
    "Matale":        {"population": 484531,  "houses": 115000},
    "Matara":        {"population": 814048,  "houses": 195000},
    "Monaragala":    {"population": 451058,  "houses": 105000},
    "Mullaitivu":    {"population": 92390,   "houses": 20000},
    "Nuwara Eliya":  {"population": 758561,  "houses": 160000},
    "Polonnaruwa":   {"population": 406088,  "houses": 95000},
    "Puttalam":      {"population": 762396,  "houses": 173000},
    "Ratnapura":     {"population": 1082387, "houses": 255000},
    "Trincomalee":   {"population": 379541,  "houses": 85000},
    "Vavuniya":      {"population": 172115,  "houses": 37000},
}

# API Configuration
API_TITLE = "Dengue Resource Allocation API"
API_DESCRIPTION = """
API for dengue risk prediction, hotspot identification, and resource allocation.

This system provides:
* District-level dengue risk classification (Low/Medium/High)
* Hotspot identification for high-risk districts
* ML-based resource recommendations (fogging units, inspectors, teams, treatment units)
* Resource management and assignment tracking
"""
API_VERSION = "1.0.0"

# Server settings
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
RELOAD = os.getenv("RELOAD", "True").lower() == "true"

# CORS settings (adjust for production)
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Resource defaults
DEFAULT_RESOURCES = {
    "Fogging_Units": 100,
    "Health_Inspectors": 50,
    "Inspection_Teams": 30,
    "Treatment_Units": 80
}

# Risk level configuration
RISK_LEVELS = ["Low", "Medium", "High"]
HOTSPOT_RISK_LEVEL = "High"

# Pilot Study Configuration
PILOT_MODE = True  # Set to False to disable pilot features
PILOT_CONFIG = {
    "city": "Colombo",
    "study_area_type": "pilot",
    "pilot_gns": [
        {
            "gn_code": "CMB-GN-01",
            "gn_name": "Kollupitiya",
            "population": 12800,
            "households": 3100,
            "centroid_lat": 6.915,
            "centroid_lon": 79.848
        },
        {
            "gn_code": "CMB-GN-02", 
            "gn_name": "Bambalapitiya",
            "population": 15600,
            "households": 3800,
            "centroid_lat": 6.894,
            "centroid_lon": 79.855
        },
        {
            "gn_code": "CMB-GN-03",
            "gn_name": "Wellawatte", 
            "population": 17400,
            "households": 4200,
            "centroid_lat": 6.875,
            "centroid_lon": 79.8615
        }
    ],
    "depot": {
        "depot_id": "DEPOT-01",
        "name": "Colombo MOH / Urban Council Pilot Depot",
        "latitude": 6.8916,
        "longitude": 79.8574
    },
    "resource_constraints": {
        "fogging_teams_per_day": 2,
        "inspection_teams_per_day": 3,
        "max_work_hours_per_team": 8
    },
    "hotspot_weights": {
        "confirmed_cases": 5,
        "breeding_sites": 3,
        "environmental_complaints": 2,
        "flagged_inspections": 2,
        "population_divisor": 1000
    }
}

# Pilot data files
PILOT_BOUNDARIES_PATH = DATA_DIR / "pilot_gn_boundaries.geojson"
PILOT_STORAGE_PATH = DATA_DIR / "pilot_storage.json"

# ==================== ROUTING SERVICE CONFIGURATION ====================

# Routing Service Provider ('mock' or 'google_maps')
ROUTING_PROVIDER = os.getenv("ROUTING_PROVIDER", "mock")

# Google Maps Configuration (required when ROUTING_PROVIDER='google_maps')
GOOGLE_MAPS_CONFIG = {
    "api_key": os.getenv("GOOGLE_MAPS_API_KEY"),
    "region": os.getenv("GOOGLE_MAPS_REGION", "LK"),  # Sri Lanka
    "language": os.getenv("GOOGLE_MAPS_LANGUAGE", "en"),
    "required_apis": [
        "Directions API",
        "Distance Matrix API", 
        "Geocoding API"
    ]
}

# Routing Service Configuration
ROUTING_CONFIG = {
    "provider": ROUTING_PROVIDER,
    "google_maps": GOOGLE_MAPS_CONFIG,
    "cache_duration_seconds": 3600,  # Cache route calculations for 1 hour
    "request_timeout_seconds": 30,   # API request timeout
    "retry_attempts": 3,             # Number of retry attempts for failed requests
    "fallback_to_mock": True,        # Fall back to mock service if real service fails
    "mock_config": {
        "average_speed_kmh": {
            "driving": 30,      # Urban speed for Colombo
            "walking": 5,
            "bicycling": 15,
            "transit": 20
        },
        "road_distance_factor": 1.3,  # Real roads are ~30% longer than straight-line
        "traffic_factors": {
            "peak": 1.5,     # Peak hours - 50% slower
            "normal": 1.0,   # Normal traffic
            "light": 0.8     # Light traffic - 20% faster
        }
    }
}