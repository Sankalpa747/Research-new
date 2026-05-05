# Dengue Resource Allocation System - Colombo Pilot

A comprehensive system for dengue control operations featuring data integration, risk assessment, resource allocation, and route planning for field operations.

## 🎯 What This Pilot Project Does

The Colombo Pilot demonstrates intelligent dengue control operations across 3 GN divisions:
- **Data Integration**: Combines reports from hospitals, government offices, urban councils, and local inspections
- **Risk Assessment**: Calculates hotspot rankings using weighted algorithm (confirmed cases × 5, breeding sites × 3, etc.)
- **Resource Allocation**: Automatically assigns fogging and inspection teams based on risk levels
- **Route Planning**: Optimizes field operation routes with mock/Google Maps integration
- **Real-time Dashboard**: Comprehensive pilot overview for presentations and operations

## 📊 Four Data Sources

The system integrates dengue data from multiple sources:

1. **Hospital Reports** (`hospital_reports.csv`)
   - Confirmed and suspected dengue cases
   - Patient admission data by GN division

2. **Divisional Secretariat Reports** (`divisional_secretariat_reports.csv`)  
   - Official population and household counts
   - Administrative area statistics

3. **Urban Council Reports** (`urban_council_reports.csv`)
   - Fogging schedules and environmental complaints
   - Stagnant water site reports

4. **GN Local Reports** (`gn_local_reports.csv`)
   - Field inspection results
   - Breeding site counts and flagged locations

## 📁 Sample Data Files

Place the sample data files in the `dengue-resource-allocation/data/` directory:

```
Research/dengue-resource-allocation/data/
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
└── route_plan.csv
```

**Note**: The sample data files are provided separately in the data package.

## 🚀 How to Run Locally

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Git**

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd Research

# Install backend dependencies
cd dengue-resource-allocation
pip install -r requirements.txt

# Or install individually:
# pip install fastapi uvicorn pandas numpy scikit-learn python-multipart

# Install frontend dependencies  
cd ../dengue-frontend
npm install
```

### 2. Environment Configuration

**Backend** (optional - uses defaults):
```bash
# Create .env in dengue-resource-allocation/ (optional)
HOST=0.0.0.0
PORT=8000
PILOT_MODE=True
ROUTING_PROVIDER=mock
```

**Frontend** (required):
```bash
# Create .env.local in dengue-frontend/
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local
```

### 3. Import Sample Data

```bash
# Copy your sample data files to:
# Research/dengue-resource-allocation/data/

# The system will automatically load data on startup
# No manual import needed - just ensure files are in place
```

### 4. Run Backend (Terminal 1)

```bash
cd Research/dengue-resource-allocation
python -m uvicorn backend.main:app --reload

# Should start on: http://localhost:8000
# API docs available at: http://localhost:8000/docs
```

### 5. Run Frontend (Terminal 2)

```bash
cd Research/dengue-frontend  
npm run dev

# Should start on: http://localhost:5173
# Will automatically connect to backend via VITE_API_BASE_URL
```

## 🧪 Testing the System

### 1. **Test Data Entry Forms**
- Navigate to: `http://localhost:5173/reports`
- Try creating reports from each source:
  - Hospital Report: `/reports/hospital`
  - Divisional Report: `/reports/divisional`  
  - Urban Council: `/reports/urban-council`
  - GN Local: `/reports/gn-local`
- Verify data appears in combined reports view

### 2. **Test Hotspot Ranking**
- Visit: `http://localhost:5173/pilot/dashboard`
- Check hotspot ranking table shows GN divisions prioritized by risk
- API endpoint: `http://localhost:8000/pilot/hotspots`

### 3. **Test Resource Allocation**
- Visit: `http://localhost:5173/pilot/resource-allocation`
- Verify teams allocated based on hotspot rankings
- High-risk areas should get more fogging teams
- API endpoint: `http://localhost:8000/pilot/resource-allocation`

### 4. **Test Route Planning**
- Visit: `http://localhost:5173/pilot/route-planning`
- Check optimized routes visit high-risk areas first
- Verify distance and time calculations
- API endpoints: 
  - Basic: `http://localhost:8000/pilot/route-plan`
  - Enhanced: `http://localhost:8000/pilot/route-plan/enhanced`

## 🎯 Colombo GN Pilot (New)

### Pilot Pages & Endpoints

**Frontend Pages:**
- **Pilot Dashboard**: `/pilot/dashboard` - Complete overview for presentations
- **Resource Allocation**: `/pilot/resource-allocation` - Team assignment management
- **Route Planning**: `/pilot/route-planning` - Optimized field operation routes  
- **Data Entry Forms**: `/reports/*` - Multi-source data collection

**Backend API Endpoints:**
```bash
# Pilot Configuration
GET /pilot/config          # Pilot settings and GN divisions
GET /pilot/status          # System status and statistics

# Data Management  
GET /pilot/reports         # Master dataset (all sources combined)
POST /pilot/reports        # Create new master report
GET /pilot/gn-list         # GN master list with coordinates

# Operations Planning
GET /pilot/hotspots        # Risk-based hotspot rankings
GET /pilot/resource-allocation  # Team assignments by risk level  
GET /pilot/route-plan      # Optimized route planning
GET /pilot/route-plan/enhanced  # Enhanced routing with service layer
```

### Demo Flow (5-minute presentation)

1. **Start**: `/pilot/dashboard` - Show complete pilot overview
2. **Data**: `/reports` - Demonstrate multi-source integration  
3. **Risk**: Click hotspot table - Explain algorithmic ranking
4. **Resources**: `/pilot/resource-allocation` - Show intelligent team deployment
5. **Routes**: `/pilot/route-planning` - Demonstrate optimized field operations
6. **Map**: `/map` - Optional visual confirmation

### Key Demo Points
- **3 GN Divisions**: Kollupitiya, Bambalapitiya, Wellawatte (~46K population)
- **Multi-Source Data**: Hospital + Government + Council + Local inspections  
- **Risk Algorithm**: Weighted scoring (cases×5, breeding×3, complaints×2, inspections×2)
- **Smart Allocation**: High-risk gets 2 fogging + 1 inspection, medium gets 1+1, low gets 0+1
- **Route Optimization**: Risk-first ordering with Google Maps integration ready

## 🏛️ Existing District-Level Features

**All existing functionality remains fully operational:**

- **Main Dashboard**: `/` - District-level overview (unchanged)
- **Resources**: `/resources` - Sri Lanka district resource management
- **Hotspots**: `/hotspots` - National hotspot identification  
- **Predictions**: `/predictions` - ML-based district risk predictions
- **Admin**: `/admin` - System administration and analytics
- **Map View**: `/map` - Interactive district and pilot area visualization

The pilot system extends rather than replaces existing functionality.

## 🔧 Troubleshooting

### Common Issues

**Backend not starting:**
```bash
# Check Python dependencies
pip install fastapi uvicorn pandas numpy scikit-learn

# Verify data directory exists
ls dengue-resource-allocation/data/
```

**Frontend not connecting to backend:**
```bash
# Check environment variable
cat dengue-frontend/.env.local
# Should contain: VITE_API_BASE_URL=http://localhost:8000

# Verify backend is running
curl http://localhost:8000/
```

**No pilot data showing:**
```bash
# Verify sample data files exist
ls dengue-resource-allocation/data/*.csv

# Check pilot mode enabled
curl http://localhost:8000/pilot/config
```

**CORS errors:**
- Ensure backend includes frontend URL in CORS_ORIGINS
- Default allows localhost:5173 (Vite default port)

### API Testing
```bash
# Test backend health
curl http://localhost:8000/

# Test pilot endpoints
curl http://localhost:8000/pilot/status
curl http://localhost:8000/pilot/hotspots
curl http://localhost:8000/pilot/resource-allocation
```

## 🌟 Key Features Highlights

- **🚀 Zero Setup**: Works with mock data, no API keys required
- **📱 Responsive**: Works on desktop, tablet, and mobile  
- **🔄 Real-time**: Live data updates and status monitoring
- **🗺️ Map Ready**: Google Maps integration prepared (set ROUTING_PROVIDER=google_maps)
- **📊 Analytics**: Comprehensive reporting and statistics
- **🎯 Demo Ready**: Professional UI optimized for presentations

## 📚 Additional Documentation

- **Routing Integration**: `ROUTING_INTEGRATION_README.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`  
- **Demo Guide**: `PILOT_DASHBOARD_DEMO_GUIDE.md`
- **Quick Start**: `QUICK_START_ROUTING.md`

## 🆘 Need Help?

1. **Check the console** - Both browser and terminal show detailed errors
2. **Verify file locations** - Ensure sample data is in correct directories
3. **Test APIs directly** - Use curl or browser to test backend endpoints
4. **Check environment** - Verify VITE_API_BASE_URL is set correctly

---

**Ready to demonstrate intelligent dengue control operations!** 🦟🎯