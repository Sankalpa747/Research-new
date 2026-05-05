# 🚀 Quick Start Guide

Get the Colombo Dengue Pilot running in 5 minutes.

## Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- Sample data files (provided separately)

## 1. Setup (2 minutes)

```bash
# Clone and navigate
git clone <repository-url>
cd Research

# Backend dependencies
cd dengue-resource-allocation  
pip install fastapi uvicorn pandas numpy scikit-learn

# Frontend dependencies
cd ../dengue-frontend
npm install

# Set API connection
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local
```

## 2. Add Sample Data (1 minute)

Copy your sample data files to `Research/dengue-resource-allocation/data/`:
- `hospital_reports.csv`
- `divisional_secretariat_reports.csv`
- `urban_council_reports.csv`
- `gn_local_reports.csv`
- `gn_master_list.csv`
- `pilot_gn_boundaries.geojson`
- `pilot_study_config.json`
- Other CSV/JSON files

## 3. Run Backend (Terminal 1)

```bash
cd Research/dengue-resource-allocation
python -m uvicorn backend.main:app --reload

# ✅ Backend ready at: http://localhost:8000
```

## 4. Run Frontend (Terminal 2)

```bash
cd Research/dengue-frontend
npm run dev

# ✅ Frontend ready at: http://localhost:5173
```

## 5. Test Demo (2 minutes)

Visit: `http://localhost:5173/pilot/dashboard`

**Demo Flow:**
1. **Overview** - Complete pilot summary in one page
2. **Data Entry** - `/reports` - Try creating reports
3. **Risk Assessment** - See hotspot rankings  
4. **Resources** - `/pilot/resource-allocation` - Team assignments
5. **Routes** - `/pilot/route-planning` - Optimized field operations

## ✅ Success Indicators

- Backend: API docs at `http://localhost:8000/docs`
- Frontend: Pilot dashboard loads with data
- All quick action buttons work
- Forms submit successfully

## 🆘 Common Issues

**"Cannot connect to backend"**
```bash
# Check environment variable
cat dengue-frontend/.env.local
# Should show: VITE_API_BASE_URL=http://localhost:8000
```

**"No pilot data"**
```bash
# Verify data files exist
ls dengue-resource-allocation/data/*.csv
```

**"API errors"**
```bash
# Test backend directly
curl http://localhost:8000/pilot/status
```

---

**🎯 Ready for demo!** Visit `/pilot/dashboard` for the complete overview.