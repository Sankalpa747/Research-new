# Google Maps Routing Integration Guide

This document explains the routing service integration added to the Dengue Resource Allocation system, including setup instructions for future Google Maps API integration.

## Overview

The system now includes a routing service abstraction layer that:
- Works with mock data for development and demos (no API keys required)
- Provides a clean interface for future Google Maps integration
- Supports multiple travel modes (driving, walking, bicycling, transit)
- Calculates realistic travel times and distances
- Includes turn-by-turn direction capabilities

## Current Implementation

### Mock Mode (Default)
- Uses Haversine distance calculations with road factor estimation
- Provides realistic travel times for urban areas (30 km/h average)
- Generates mock turn-by-turn instructions
- **No API keys required** - perfect for development and demos

### Future Google Maps Integration
- Clean interface ready for Google Maps APIs
- Environment variable configuration
- Fallback to mock mode if API fails
- Support for real-time traffic and road conditions

## File Structure

### Backend Files
```
backend/
├── services/
│   ├── __init__.py
│   └── routing_service.py          # Routing service interface and implementations
├── routes/
│   └── pilot.py                    # Enhanced with routing service integration
└── config.py                       # Updated with routing configuration

New API Endpoints:
- GET /pilot/route-plan/enhanced    # Enhanced route planning with routing service
```

### Frontend Files
```
src/
├── services/
│   ├── api.js                      # Updated with new routing endpoints  
│   └── routingService.js           # Frontend routing service interface
└── ...
```

### Environment Configuration
```
.env.example                        # Backend environment template
dengue-frontend/.env.example        # Frontend environment template
```

## Environment Variables

### Backend Environment Variables

Copy `Research/dengue-resource-allocation/.env.example` to `.env` and configure:

```bash
# Routing Service Configuration
ROUTING_PROVIDER=mock              # Use 'mock' for demo, 'google_maps' for production

# Google Maps Integration (when ROUTING_PROVIDER=google_maps)
GOOGLE_MAPS_API_KEY=your_api_key_here
GOOGLE_MAPS_REGION=LK
GOOGLE_MAPS_LANGUAGE=en
```

### Frontend Environment Variables

Copy `Research/dengue-frontend/.env.example` to `.env.local` and configure:

```bash
# Routing Service Configuration  
VITE_ROUTING_PROVIDER=mock         # Use 'mock' for demo, 'google_maps' for production

# Google Maps Integration (when VITE_ROUTING_PROVIDER=google_maps)
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
VITE_GOOGLE_MAPS_REGION=LK
VITE_GOOGLE_MAPS_LANGUAGE=en
```

## Demo Usage (No API Keys Required)

The system works immediately with mock data:

### 1. Backend Usage
```python
# Example: Calculate travel time between two points
from backend.services.routing_service import calculate_travel_time

# Get travel time from depot to GN area
distance_m, duration_s = await calculate_travel_time(
    origin_lat=6.8916,    # Depot
    origin_lon=79.8574,
    dest_lat=6.915,       # Kollupitiya GN
    dest_lon=79.848,
    origin_name="Depot",
    dest_name="Kollupitiya"
)

print(f"Distance: {distance_m/1000:.1f} km, Time: {duration_s/60:.1f} minutes")
```

### 2. Frontend Usage
```javascript
// Example: Use routing service in React component
import { useRouting, TRAVEL_MODES } from '../services/routingService';

function RouteComponent() {
  const { calculateTravelTime, planMultiStopRoute } = useRouting();
  
  const calculateRoute = async () => {
    // Calculate travel time between two points
    const [distance, duration] = await calculateTravelTime(
      6.8916, 79.8574,  // Depot coordinates
      6.915, 79.848,    // Destination coordinates  
      "Depot", "Kollupitiya"
    );
    
    console.log(`Route: ${distance/1000:.1f}km, ${duration/60:.1f}min`);
  };
  
  return (
    <button onClick={calculateRoute}>
      Calculate Route
    </button>
  );
}
```

### 3. API Endpoints
```bash
# Get enhanced route plan using routing service
GET /pilot/route-plan/enhanced

# Compare with basic route plan (original implementation)
GET /pilot/route-plan

# Get routing configuration
GET /pilot/route-plan/config
```

## Google Maps Integration Setup

### Prerequisites

1. **Google Cloud Console Setup**
   - Create a Google Cloud Project
   - Enable required APIs:
     - Maps JavaScript API (frontend)
     - Directions API (backend)
     - Distance Matrix API (backend)  
     - Geocoding API (optional)

2. **API Key Creation**
   - Generate API key in Google Cloud Console
   - Restrict key to your domains/IPs for security
   - Set appropriate API restrictions

### Step-by-Step Integration

#### 1. Install Dependencies (Backend)
```bash
# Add to requirements.txt or install directly
pip install googlemaps
```

#### 2. Install Dependencies (Frontend)
```bash
# Add Google Maps JavaScript API to HTML or via package
npm install @googlemaps/js-api-loader
```

#### 3. Update Environment Variables
```bash
# Backend .env
ROUTING_PROVIDER=google_maps
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX

# Frontend .env.local  
VITE_ROUTING_PROVIDER=google_maps
VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### 4. Implement Google Maps Service (Backend)
The `GoogleMapsRoutingService` class in `backend/services/routing_service.py` provides the structure. Complete implementation:

```python
class GoogleMapsRoutingService(RoutingServiceInterface):
    def __init__(self, api_key: str):
        self.api_key = api_key
        import googlemaps
        self.gmaps = googlemaps.Client(key=api_key)
    
    async def calculate_route(self, origin, destination, **kwargs):
        # Implement using self.gmaps.directions()
        pass
    
    async def calculate_distance_matrix(self, origins, destinations, **kwargs):
        # Implement using self.gmaps.distance_matrix() 
        pass
```

#### 5. Implement Google Maps Service (Frontend)
The `GoogleMapsRoutingService` class in `frontend/src/services/routingService.js` provides the structure. Complete implementation using Google Maps JavaScript API.

### Security Considerations

1. **API Key Security**
   - Never commit API keys to version control
   - Use environment variables
   - Restrict API keys by domain/IP
   - Set appropriate API usage limits

2. **Rate Limiting**
   - Implement caching for frequent routes
   - Add request throttling
   - Use batch requests where possible

3. **Error Handling**
   - Always provide fallback to mock service
   - Handle API quota exceeded errors
   - Implement retry logic with exponential backoff

## API Reference

### RoutePoint
```javascript
{
  latitude: number,
  longitude: number, 
  name: string,
  address?: string,
  placeId?: string
}
```

### RouteResponse  
```javascript
{
  segments: RouteSegment[],
  totalDistanceMeters: number,
  totalDurationSeconds: number,
  totalDistanceText: string,
  totalDurationText: string,
  overviewPolyline?: string,
  waypoints?: RoutePoint[],
  status: 'OK' | 'ERROR',
  errorMessage?: string
}
```

### Enhanced Route Plan API Response
```json
{
  "status": "success",
  "route_plan": {
    "route_overview": {
      "total_distance_km": 12.5,
      "total_duration_minutes": 28.5,
      "total_stops": 5,
      "gn_areas_visited": 3
    },
    "segments": [
      {
        "segment_number": 1,
        "from": { "name": "Depot", "latitude": 6.8916, "longitude": 79.8574 },
        "to": { "name": "Kollupitiya", "latitude": 6.915, "longitude": 79.848 },
        "distance": { "meters": 3250, "text": "3.3 km" },
        "duration": { "seconds": 390, "text": "7 min" },
        "gn_area": {
          "gn_code": "CMB-GN-01", 
          "risk_level": "High",
          "priority_rank": 1
        },
        "instructions": ["Head southeast from Depot", "..."]
      }
    ]
  },
  "routing_service": {
    "provider": "mock",
    "integration_status": "Mock mode - suitable for development"
  }
}
```

## Testing

### Mock Service Testing
```bash
# Backend tests
python -m pytest tests/test_routing_service.py

# Test API endpoints
curl http://localhost:8000/pilot/route-plan/enhanced
```

### Google Maps Integration Testing
1. Set up test API key with low quotas
2. Test with real locations in Colombo
3. Verify fallback to mock service on API failures
4. Test rate limiting and error handling

## Cost Considerations

### Google Maps API Pricing (as of 2024)
- **Directions API**: $5 per 1,000 requests
- **Distance Matrix API**: $10 per 1,000 elements  
- **Maps JavaScript API**: $7 per 1,000 loads

### Optimization Strategies
1. **Caching**: Cache frequent routes for 1-24 hours
2. **Batching**: Use Distance Matrix API for multiple point calculations
3. **Fallback**: Use mock service for development and when API quotas exceeded
4. **Request Optimization**: Only request necessary data fields

## Future Enhancements

### Phase 2: Advanced Features
- Real-time traffic integration
- Multiple vehicle types (motorcycle, van, etc.)
- Route optimization for multiple teams
- Integration with mobile apps for field workers

### Phase 3: Intelligence Features  
- ML-based travel time prediction
- Historical traffic pattern analysis
- Dynamic re-routing based on field conditions
- Integration with dengue hotspot updates

### Phase 4: Full Fleet Management
- Real-time GPS tracking
- Team coordination and dispatch
- Performance analytics and reporting
- Integration with resource management system

## Support and Troubleshooting

### Common Issues

1. **"Google Maps integration is not yet implemented"**
   - Expected behavior when `ROUTING_PROVIDER=google_maps`
   - Complete the Google Maps service implementation
   - Or set `ROUTING_PROVIDER=mock` for demo mode

2. **API Key Errors**
   - Verify API key is correct
   - Check API restrictions and permissions
   - Ensure required APIs are enabled in Google Cloud Console

3. **CORS Issues (Frontend)**
   - Add your domain to API key restrictions
   - Check browser console for specific CORS errors

4. **Mock Service Not Working**
   - Check that no API keys are set (should fall back to mock automatically)
   - Verify `ROUTING_PROVIDER=mock` in environment

### Getting Help
- Check the console logs for detailed error messages
- Review environment variable configuration  
- Test with curl to isolate frontend vs backend issues
- Use mock service first to verify basic functionality

## Conclusion

This routing integration provides:
✅ **Immediate functionality** with mock data (no setup required)  
✅ **Production-ready architecture** for Google Maps integration
✅ **Comprehensive documentation** for future development
✅ **Fallback mechanisms** for reliability
✅ **Environment-based configuration** for different deployment stages

The system is now ready for both demo usage and future production deployment with Google Maps APIs.