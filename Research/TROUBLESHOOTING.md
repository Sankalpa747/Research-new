# 🔧 Troubleshooting Guide

Common issues and solutions for the Dengue Resource Allocation System.

## 🚨 Backend Issues

### "ModuleNotFoundError" or Import Errors
```bash
# Install missing dependencies
pip install fastapi uvicorn pandas numpy scikit-learn python-multipart

# Or install all at once
cd dengue-resource-allocation
pip install -r requirements.txt  # if available
```

### "Port 8000 already in use"
```bash
# Find what's using port 8000
lsof -i :8000

# Kill the process (replace PID)
kill -9 <PID>

# Or use different port
python -m uvicorn backend.main:app --reload --port 8001
# Then update frontend .env.local to: VITE_API_BASE_URL=http://localhost:8001
```

### "FileNotFoundError" - Missing Data Files
```bash
# Check data directory exists and has files
ls dengue-resource-allocation/data/
# Should show: *.csv, *.geojson, *.json files

# Create data directory if missing
mkdir -p dengue-resource-allocation/data

# Copy sample data files to this directory
```

### Backend Starts but API Errors
```bash
# Check if backend is really running
curl http://localhost:8000/
# Should return: {"message": "Dengue Resource Allocation API", ...}

# Check specific endpoints
curl http://localhost:8000/pilot/config
curl http://localhost:8000/pilot/status
```

## 🚨 Frontend Issues

### "VITE_API_BASE_URL is not defined"
```bash
# Create or check .env.local file
cd dengue-frontend
cat .env.local
# Should contain: VITE_API_BASE_URL=http://localhost:8000

# Create if missing
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local

# Restart dev server after changing .env files
npm run dev
```

### "npm install" Errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Use different registry if needed
npm install --registry https://registry.npmjs.org/
```

### "Cannot connect to backend" / Network Errors
```bash
# 1. Verify backend is running
curl http://localhost:8000/

# 2. Check frontend environment
cat dengue-frontend/.env.local

# 3. Check browser console for CORS errors
# Open browser dev tools (F12) and look for red errors

# 4. Try accessing backend directly in browser
# Visit: http://localhost:8000/docs
```

### "Port 5173 already in use"
```bash
# Kill existing Vite process
pkill -f vite

# Or use different port
npm run dev -- --port 5174
# Then use: http://localhost:5174
```

## 🚨 Data Issues

### "No hotspots showing" / Empty Dashboard
```bash
# 1. Check if pilot mode is enabled
curl http://localhost:8000/pilot/config
# Should return pilot configuration, not 404

# 2. Verify sample data files
ls dengue-resource-allocation/data/
# Must include: hospital_reports.csv, divisional_secretariat_reports.csv, etc.

# 3. Check file formats (CSV files should have headers)
head -n 3 dengue-resource-allocation/data/hospital_reports.csv

# 4. Check pilot endpoints directly
curl http://localhost:8000/pilot/hotspots
curl http://localhost:8000/pilot/resource-allocation
```

### "Invalid GN codes" / Data Format Errors
```bash
# Check GN master list exists and has correct format
cat dengue-resource-allocation/data/gn_master_list.csv | head -5

# Verify GN codes match between files
# All files should use same GN code format (e.g., CMB-GN-01, CMB-GN-02, CMB-GN-03)
```

## 🚨 Browser Issues

### Dashboard Loads but No Data
```bash
# 1. Open browser developer tools (F12)
# 2. Check Console tab for errors
# 3. Check Network tab - API calls should return 200 OK

# 4. Test API endpoints manually
# Visit: http://localhost:8000/pilot/status
# Should return JSON with pilot information
```

### Forms Don't Submit
```bash
# 1. Check browser console for errors
# 2. Verify backend is accepting POST requests
curl -X POST http://localhost:8000/pilot/reports \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# 3. Check CORS settings in backend config
# Should include frontend URL in CORS_ORIGINS
```

## 🚨 Environment Issues

### Different Operating System Issues

**Windows:**
```bash
# Use PowerShell or Command Prompt
# Python command might be 'py' instead of 'python'
py -m uvicorn backend.main:app --reload

# Path separators use backslashes
dir dengue-resource-allocation\data\
```

**macOS:**
```bash
# Might need to install Python via Homebrew
brew install python

# Use python3 explicitly
python3 -m uvicorn backend.main:app --reload
```

**Linux:**
```bash
# Install Python development headers if needed
sudo apt-get install python3-dev python3-pip

# Use python3 explicitly
python3 -m uvicorn backend.main:app --reload
```

## 🚨 Performance Issues

### Slow Loading
```bash
# 1. Check if you're running in development mode
# Both backend (--reload) and frontend (npm run dev) are slower in dev mode

# 2. Check network requests in browser dev tools
# Look for slow API calls or failing requests

# 3. Ensure sample data files aren't too large
ls -lh dengue-resource-allocation/data/*.csv
# CSV files should be under 10MB for good performance
```

## ✅ Health Check Script

Save this as `health_check.sh` for quick diagnosis:

```bash
#!/bin/bash
echo "🏥 Dengue System Health Check"
echo "=============================="

echo "1. Checking backend..."
if curl -s http://localhost:8000/ > /dev/null; then
    echo "✅ Backend running at :8000"
else
    echo "❌ Backend not responding at :8000"
fi

echo "2. Checking frontend..."
if curl -s http://localhost:5173/ > /dev/null; then
    echo "✅ Frontend running at :5173"  
else
    echo "❌ Frontend not responding at :5173"
fi

echo "3. Checking data files..."
if ls dengue-resource-allocation/data/*.csv > /dev/null 2>&1; then
    echo "✅ CSV data files found"
else
    echo "❌ No CSV files in data directory"
fi

echo "4. Checking pilot endpoints..."
if curl -s http://localhost:8000/pilot/status > /dev/null; then
    echo "✅ Pilot endpoints working"
else
    echo "❌ Pilot endpoints not responding"
fi

echo "=============================="
echo "🎯 Visit: http://localhost:5173/pilot/dashboard"
```

## 📞 Still Need Help?

1. **Check all console outputs** - Both terminal windows show helpful error messages
2. **Try the health check script** above
3. **Restart everything** - Sometimes a clean restart fixes issues:
   ```bash
   # Stop both servers (Ctrl+C)
   # Restart backend, then frontend
   ```
4. **Check the main README.md** for detailed setup instructions
5. **Look at browser developer tools** (F12) for frontend errors

## 🎯 Quick Reset

If everything is broken, try this complete reset:

```bash
# Stop all servers (Ctrl+C in both terminals)

# Backend reset
cd dengue-resource-allocation
rm -f data/storage.json  # Remove cached data
python -m uvicorn backend.main:app --reload

# Frontend reset (new terminal)
cd dengue-frontend
rm -rf node_modules/.vite  # Clear Vite cache
npm run dev
```

Most issues are resolved by ensuring:
1. ✅ Backend running on :8000
2. ✅ Frontend running on :5173  
3. ✅ VITE_API_BASE_URL=http://localhost:8000 in .env.local
4. ✅ Sample data files in data/ directory