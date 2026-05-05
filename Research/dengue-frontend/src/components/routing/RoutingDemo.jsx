/**
 * Routing Service Demo Component
 * 
 * This component demonstrates how to use the routing service interface
 * in React components. It shows both mock and future Google Maps integration.
 */

import React, { useState, useEffect } from 'react';
import { 
  useRouting, 
  RoutePoint, 
  TRAVEL_MODES, 
  ROUTING_PROVIDERS 
} from '../../services/routingService';
import { pilotAPI } from '../../services/api';

const RoutingDemo = () => {
  const routing = useRouting();
  
  // State
  const [routeResult, setRouteResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [travelMode, setTravelMode] = useState(TRAVEL_MODES.DRIVING);
  const [enhancedRoute, setEnhancedRoute] = useState(null);
  
  // Sample locations (Colombo pilot areas)
  const depot = new RoutePoint(6.8916, 79.8574, "MOH Depot");
  const gnAreas = [
    new RoutePoint(6.915, 79.848, "Kollupitiya (CMB-GN-01)"),
    new RoutePoint(6.894, 79.855, "Bambalapitiya (CMB-GN-02)"),
    new RoutePoint(6.875, 79.8615, "Wellawatte (CMB-GN-03)")
  ];
  
  // Calculate simple route
  const calculateSimpleRoute = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await routing.calculateRoute(
        depot,
        gnAreas[0], // Route to first GN area
        {
          travelMode,
          waypoints: [],
          optimizeWaypoints: false
        }
      );
      
      setRouteResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate multi-stop route
  const calculateMultiStopRoute = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await routing.planMultiStopRoute(
        depot.latitude,
        depot.longitude,
        gnAreas.map(gn => ({
          latitude: gn.latitude,
          longitude: gn.longitude,
          name: gn.name
        })),
        "MOH Depot",
        {
          optimizeOrder: true,
          returnToDepot: true,
          travelMode
        }
      );
      
      setRouteResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Get enhanced route from backend API
  const getEnhancedRoute = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await pilotAPI.getEnhancedRoutePlan();
      setEnhancedRoute(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Load enhanced route on component mount
  useEffect(() => {
    getEnhancedRoute();
  }, []);
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Routing Service Demo
      </h2>
      
      {/* Service Status */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Service Configuration</h3>
        <div className="text-sm text-blue-600">
          <p>Provider: <code>mock</code> (No API keys required)</p>
          <p>Mode: Development/Demo suitable</p>
          <p>Future: Set <code>VITE_ROUTING_PROVIDER=google_maps</code> for production</p>
        </div>
      </div>
      
      {/* Travel Mode Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Travel Mode
        </label>
        <select
          value={travelMode}
          onChange={(e) => setTravelMode(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={TRAVEL_MODES.DRIVING}>Driving (30 km/h avg)</option>
          <option value={TRAVEL_MODES.WALKING}>Walking (5 km/h)</option>
          <option value={TRAVEL_MODES.BICYCLING}>Bicycling (15 km/h)</option>
          <option value={TRAVEL_MODES.TRANSIT}>Transit (20 km/h avg)</option>
        </select>
      </div>
      
      {/* Action Buttons */}
      <div className="mb-6 space-x-4">
        <button
          onClick={calculateSimpleRoute}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Simple Route (Depot → Kollupitiya)'}
        </button>
        
        <button
          onClick={calculateMultiStopRoute}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Multi-Stop Route (All GN Areas)'}
        </button>
        
        <button
          onClick={getEnhancedRoute}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Backend Enhanced Route'}
        </button>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">Error: {error}</p>
        </div>
      )}
      
      {/* Frontend Route Result */}
      {routeResult && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Frontend Route Result
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Total Distance</p>
                <p className="text-lg font-semibold">{routeResult.totalDistanceText}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Duration</p>
                <p className="text-lg font-semibold">{routeResult.totalDurationText}</p>
              </div>
            </div>
            
            {routeResult.segments.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Route Segments</h4>
                <div className="space-y-2">
                  {routeResult.segments.map((segment, index) => (
                    <div key={index} className="p-3 bg-white rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {segment.startPoint.name} → {segment.endPoint.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {segment.distanceText} • {segment.durationText}
                          </p>
                        </div>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {segment.travelMode}
                        </span>
                      </div>
                      
                      {segment.instructions && segment.instructions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Instructions:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {segment.instructions.slice(0, 3).map((instruction, i) => (
                              <li key={i}>• {instruction}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Backend Enhanced Route */}
      {enhancedRoute && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Backend Enhanced Route
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            {enhancedRoute.route_plan?.route_overview && (
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-lg font-semibold">
                    {enhancedRoute.route_plan.route_overview.total_distance_km} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-lg font-semibold">
                    {enhancedRoute.route_plan.route_overview.total_duration_minutes} min
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">GN Areas</p>
                  <p className="text-lg font-semibold">
                    {enhancedRoute.route_plan.route_overview.gn_areas_visited}
                  </p>
                </div>
              </div>
            )}
            
            {enhancedRoute.route_plan?.waypoints && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Route Waypoints</h4>
                <div className="space-y-2">
                  {enhancedRoute.route_plan.waypoints.map((waypoint, index) => (
                    <div key={index} className="p-2 bg-white rounded border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{waypoint.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            waypoint.risk_level === 'High' ? 'bg-red-100 text-red-800' :
                            waypoint.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {waypoint.risk_level}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Rank {waypoint.priority_rank}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Integration Information */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">
          🚀 Google Maps Integration Ready
        </h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>• Current: Mock routing service (no API keys required)</p>
          <p>• Production: Set environment variables for Google Maps</p>
          <p>• <code>VITE_GOOGLE_MAPS_API_KEY</code> → Your Google Maps API key</p>
          <p>• <code>VITE_ROUTING_PROVIDER=google_maps</code> → Enable Google Maps</p>
          <p>• APIs needed: Maps JavaScript, Directions, Distance Matrix</p>
        </div>
      </div>
      
      {/* Code Example */}
      <div className="mt-6">
        <h4 className="font-semibold text-gray-700 mb-2">Usage Example</h4>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// Import routing service
import { useRouting, TRAVEL_MODES } from './services/routingService';

// Use in component
const { calculateTravelTime, planMultiStopRoute } = useRouting();

// Calculate travel time
const [distance, duration] = await calculateTravelTime(
  6.8916, 79.8574,  // Origin (depot)
  6.915, 79.848,    // Destination (GN area)
  "Depot", "Kollupitiya"
);

console.log(\`Route: \${distance/1000:.1f}km, \${duration/60:.1f}min\`);`}
        </pre>
      </div>
    </div>
  );
};

export default RoutingDemo;