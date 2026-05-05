"""
Configuration Module
Central configuration for the backend API
"""

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
HOST = "0.0.0.0"
PORT = 8000
RELOAD = True  # Set to False in production

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