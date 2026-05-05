# Dengue Resource Allocation - Backend API

FastAPI backend service for the Dengue Resource Allocation System.

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Or individually:
# pip install fastapi uvicorn pandas numpy scikit-learn python-multipart

# Place sample data files in data/ directory
# Copy: *.csv, *.geojson, *.json files to data/

# Run the server
python -m uvicorn backend.main:app --reload

# API available at: http://localhost:8000
# Interactive docs: http://localhost:8000/docs
```

## 📁 Data Directory Structure

```
data/
├── hospital_reports.csv
├── divisional_secretariat_reports.csv
├── urban_council_reports.csv
├── gn_local_reports.csv
├── gn_master_list.csv
├── pilot_gn_boundaries.geojson
├── pilot_study_config.json
├── hotspot_summary.csv
├── master_reports.csv
├── resource_allocation_plan.csv
├── route_plan.csv
└── storage.json (auto-created)
```

## 🔧 Environment Variables

Create `.env` file (optional - uses defaults):
```bash
HOST=0.0.0.0
PORT=8000
RELOAD=True
PILOT_MODE=True
ROUTING_PROVIDER=mock
CORS_ORIGINS=["http://localhost:5173"]
```

## 📡 API Endpoints

### Pilot Operations
- `GET /pilot/config` - Pilot configuration
- `GET /pilot/status` - System status
- `GET /pilot/hotspots` - Risk rankings
- `GET /pilot/resource-allocation` - Team assignments
- `GET /pilot/route-plan` - Route optimization
- `GET /pilot/reports` - Master dataset
- `POST /pilot/reports` - Create reports

### District Level
- `GET /predictions/districts` - District predictions
- `GET /predictions/hotspots` - National hotspots  
- `GET /resources/` - Available resources
- `GET /admin/overview` - System overview

## 🧪 Testing

```bash
# Health check
curl http://localhost:8000/

# Test pilot endpoints
curl http://localhost:8000/pilot/status
curl http://localhost:8000/pilot/hotspots

# View API documentation
open http://localhost:8000/docs
```

## 📊 Data Processing

The system automatically:
- Loads CSV data on startup
- Calculates hotspot risk scores
- Generates resource allocations
- Optimizes route planning
- Provides JSON storage for reports

No manual data import required - just place files in `data/` directory.