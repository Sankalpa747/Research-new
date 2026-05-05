# Quick Start: Routing Integration

## 🚀 Immediate Demo Usage (No Setup Required)

The routing system works out of the box with realistic mock data. Perfect for demos and development.

### 1. Test Backend API (30 seconds)

```bash
# Start backend server
cd Research/dengue-resource-allocation  
python -m uvicorn backend.main:app --reload

# Test new routing endpoint
curl http://localhost:8000/pilot/route-plan/enhanced
```

**Expected Response:**
```json
{
  "status": "success",
  "route_plan": {
    "route_overview": {
      "total_distance_km": 8.2,
      "total_duration_minutes": 16.4,
      "gn_areas_visited": 3
    },
    "segments": [...],
    "waypoints": [...]
  },
  "routing_service": {
    "provider": "mock",
    "integration_status": "Mock mode - suitable for development"
  }
}
```

### 2. Use in Frontend (React Component)

```javascript
// Import routing service
import { useRouting, calculateTravelTime } from '../services/routingService';

// Component example
function MyRouteComponent() {
  const { getTravelTime } = useRouting();
  
  const handleCalculateRoute = async () => {
    // Calculate travel time between depot and GN area
    const [distance, duration] = await calculateTravelTime(
      6.8916, 79.8574,  // Depot coordinates
      6.915, 79.848,    // Kollupitiya GN coordinates
      "MOH Depot", "Kollupitiya"
    );
    
    console.log(`Distance: ${(distance/1000).toFixed(1)} km`);
    console.log(`Duration: ${(duration/60).toFixed(1)} minutes`);
  };
  
  return (
    <button onClick={handleCalculateRoute}>
      Calculate Route
    </button>
  );
}
```

### 3. Demo Component

Use the pre-built demo component:

```javascript
// Add to your React app
import RoutingDemo from './components/routing/RoutingDemo';

function App() {
  return (
    <div>
      <RoutingDemo />
    </div>
  );
}
```

## 🔧 Future Google Maps Setup (When Ready)

### Environment Variables Setup

**Backend (.env):**
```bash
# Copy from .env.example and update
ROUTING_PROVIDER=google_maps
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
```

**Frontend (.env.local):**
```bash
# Copy from .env.example and update  
VITE_ROUTING_PROVIDER=google_maps
VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
```

### Google Cloud Setup Checklist

1. **Create Google Cloud Project**
2. **Enable APIs:**
   - Maps JavaScript API
   - Directions API  
   - Distance Matrix API
3. **Create API Key**
4. **Set Environment Variables**
5. **Install Dependencies:**
   ```bash
   pip install googlemaps              # Backend
   npm install @googlemaps/js-api-loader  # Frontend
   ```

## 📋 API Reference (Quick)

### Enhanced Route Planning
```bash
GET /pilot/route-plan/enhanced
```

**Response includes:**
- Total distance and duration
- Route segments with turn-by-turn directions
- GN area risk levels and priorities  
- Routing service provider status

### Frontend Routing Service
```javascript
import { useRouting, TRAVEL_MODES } from '../services/routingService';

const routing = useRouting();

// Available methods:
await routing.calculateRoute(origin, destination, options)
await routing.calculateDistanceMatrix(origins, destinations, options)  
await routing.getTravelTime(origin, destination, options)

// Utility functions:
await calculateTravelTime(lat1, lon1, lat2, lon2, name1, name2)
await planMultiStopRoute(depotLat, depotLon, stops, depotName, options)
```

### Travel Modes
```javascript
TRAVEL_MODES.DRIVING    // 30 km/h (default)
TRAVEL_MODES.WALKING    // 5 km/h  
TRAVEL_MODES.BICYCLING  // 15 km/h
TRAVEL_MODES.TRANSIT    // 20 km/h
```

## 🎯 What Works Right Now

✅ **Backend routing service** - Complete interface and mock implementation  
✅ **Frontend routing service** - React hooks and utilities  
✅ **Enhanced route planning** - API endpoint with realistic data  
✅ **Multiple travel modes** - Driving, walking, cycling, transit  
✅ **Turn-by-turn directions** - Mock instruction generation  
✅ **Environment configuration** - Ready for Google Maps switch  
✅ **Error handling** - Graceful fallbacks and error messages  
✅ **Documentation** - Complete setup and usage guides  

## 🔍 File Locations (Key Files)

```
Research/
├── dengue-resource-allocation/backend/
│   ├── services/routing_service.py           # Main routing service
│   ├── routes/pilot.py                       # Enhanced route endpoint  
│   └── config.py                             # Routing configuration
├── dengue-frontend/src/
│   ├── services/routingService.js            # Frontend routing service
│   ├── services/api.js                       # API client (updated)
│   └── components/routing/RoutingDemo.jsx    # Demo component
├── ROUTING_INTEGRATION_README.md             # Complete guide
├── IMPLEMENTATION_SUMMARY.md                 # Implementation details
└── QUICK_START_ROUTING.md                    # This file
```

## 🚨 Troubleshooting

### Common Issues

**"No route data available"**
- Ensure backend is running and pilot mode is enabled
- Check that hotspot data exists (run prediction generation if needed)

**"Routing service error"**  
- Check console logs for detailed error message
- Verify environment variables are set correctly
- Ensure no conflicting API keys (should use mock by default)

**CORS errors (frontend)**
- Verify CORS_ORIGINS includes your frontend URL in backend config
- Check that API_BASE_URL is correct in frontend

### Quick Debug Commands

```bash
# Check backend routing service status
curl http://localhost:8000/pilot/route-plan/config

# Test simple pilot endpoint 
curl http://localhost:8000/pilot/config

# Check environment variables
echo $ROUTING_PROVIDER
echo $VITE_ROUTING_PROVIDER
```

## 📞 Need Help?

1. **Check console logs** - Both browser and server logs show detailed errors
2. **Review documentation** - See `ROUTING_INTEGRATION_README.md` for comprehensive guide
3. **Test with curl** - Isolate frontend vs backend issues  
4. **Use mock service** - Remove any API keys to ensure fallback to mock mode

## ✨ Demo Script (30-second pitch)

> "Our dengue control system now includes intelligent route planning. Watch this..."
> 
> 1. **Show API call:** `curl /pilot/route-plan/enhanced` 
>    → Real-time route calculation with distances and travel times
> 
> 2. **Show frontend demo:** Click "Multi-Stop Route" button
>    → Interactive route planning with risk-based prioritization
> 
> 3. **Highlight future:** "This runs on mock data now, but we can switch to Google Maps instantly by setting one environment variable. No code changes needed."
> 
> **Key points:** ✅ Works immediately ✅ Production-ready architecture ✅ Zero setup friction

The system is ready for immediate demonstration and future production deployment!