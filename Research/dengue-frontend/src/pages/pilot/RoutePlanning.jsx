import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Navigation, Clock, Route, RefreshCw, Info, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import BaseMap from '../../components/maps/BaseMap';
import RouteVisualization from '../../components/maps/RouteVisualization';
import { useRouteData } from '../../hooks/useRouteData';

const RoutePlanning = () => {
  const { 
    routeData, 
    loading, 
    error, 
    lastUpdated, 
    reload: reloadRouteData,
    getRouteStops,
    getRouteSummary,
    getDepotLocation,
    getGNStops,
    getRouteBounds,
    getRouteStats
  } = useRouteData();

  const [showRoute, setShowRoute] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showStopNumbers, setShowStopNumbers] = useState(true);

  const routeStops = getRouteStops();
  const routeSummary = getRouteSummary();
  const depot = getDepotLocation();
  const gnStops = getGNStops();
  const routeBounds = getRouteBounds();
  const routeStats = getRouteStats();

  // Map center - use route bounds center or depot location
  const mapCenter = routeBounds ? routeBounds.center : 
                   depot ? [depot.latitude, depot.longitude] : 
                   [6.9271, 79.8612]; // Default Colombo center

  const getRiskBadgeColor = (level) => {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading route plan...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Route Planning</h1>
              <p className="mt-1 text-sm text-gray-600">
                Optimized visit sequence for dengue control operations in pilot GN areas
              </p>
              
              {lastUpdated && (
                <p className="mt-2 text-xs text-gray-500">
                  Last updated: {lastUpdated.toLocaleString()}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Route Display Controls */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setShowRoute(!showRoute)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    showRoute ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Route Lines
                </button>
                <button
                  onClick={() => setShowMarkers(!showMarkers)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    showMarkers ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Markers
                </button>
                <button
                  onClick={() => setShowStopNumbers(!showStopNumbers)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    showStopNumbers ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Numbers
                </button>
              </div>
              
              <button
                onClick={reloadRouteData}
                disabled={loading}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Route</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Route Summary Cards */}
        {routeSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center">
                <Navigation className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Total Distance</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {routeSummary.total_distance_km} km
                  </p>
                  <p className="text-xs text-blue-600">Straight-line routing</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Travel Time</p>
                  <p className="text-2xl font-bold text-green-900">
                    {routeSummary.estimated_travel_time_hours}h
                  </p>
                  <p className="text-xs text-green-600">Estimated at 30 km/h</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center">
                <MapPin className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Total Stops</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {routeSummary.total_stops}
                  </p>
                  <p className="text-xs text-purple-600">{routeSummary.gn_areas_visited} GN areas + depot</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="flex items-center">
                <Route className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-600">Route Type</p>
                  <p className="text-sm font-bold text-orange-900">
                    {routeSummary.route_efficiency}
                  </p>
                  <p className="text-xs text-orange-600">Risk-priority based</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Algorithm Explanation */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Route Planning Algorithm
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-3">Current Approach (Simple & Fast)</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div>🎯 <strong>Priority First:</strong> Visit high-risk areas first (Bambalapitiya → Wellawatte → Kollupitiya)</div>
                <div>📏 <strong>Distance Calculation:</strong> Uses Haversine formula for straight-line distances</div>
                <div>🏢 <strong>Depot Start/End:</strong> Begin and return to Colombo MOH depot</div>
                <div>⏱️ <strong>Time Estimation:</strong> Assumes 30 km/h average urban speed</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-800 mb-3">Future Integration Options</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div>🗺️ <strong>Google Maps API:</strong> Real road routing with traffic</div>
                <div>🛣️ <strong>OpenRouteService:</strong> Open-source routing alternative</div>
                <div>📱 <strong>Mapbox:</strong> Turn-by-turn navigation support</div>
                <div>👥 <strong>Multi-team:</strong> Coordinate multiple teams with different routes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Route Visualization
              </h3>
              <p className="text-sm text-gray-600">
                Interactive map showing optimized visit sequence with depot and GN area stops
              </p>
            </div>
          </div>
          
          <div className="relative">
            <BaseMap
              center={mapCenter}
              zoom={13}
              height="500px"
              className="border border-gray-200 rounded-lg"
            >
              {routeData && (
                <RouteVisualization
                  routeData={routeData}
                  showRoute={showRoute}
                  showMarkers={showMarkers}
                  showStopNumbers={showStopNumbers}
                />
              )}
            </BaseMap>
            
            {/* Map Legend */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000] min-w-[200px]">
              <h4 className="font-medium text-gray-900 text-sm mb-3">Legend</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  <span>Depot (Start/End)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                  <span>High Risk GN</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full border border-white"></div>
                  <span>Medium Risk GN</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                  <span>Low Risk GN</span>
                </div>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-blue-600"></div>
                  <span>Main Route</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-purple-400 border-dashed border-t"></div>
                  <span>Route Segments</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Route Stops Table */}
        {routeStops.length > 0 && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Route Sequence</h3>
              <p className="text-sm text-gray-600">Detailed stop-by-stop route plan with distances and timing</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stop Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Travel Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {routeStops.map((stop) => (
                    <tr key={`${stop.location_code}-${stop.stop_order}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                            {stop.stop_order}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {stop.location_name}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {stop.location_code}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {stop.risk_level ? (
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskBadgeColor(stop.risk_level)}`}>
                              {stop.risk_level}
                            </span>
                            {stop.priority_rank && (
                              <div className="text-xs text-gray-500 mt-1">
                                Rank #{stop.priority_rank}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Depot</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {stop.distance_from_previous > 0 ? (
                            <>
                              <div className="font-medium text-gray-900">
                                {stop.distance_from_previous} km
                              </div>
                              <div className="text-gray-500 text-xs">
                                Total: {stop.cumulative_distance} km
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400">Start point</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {stop.estimated_time_minutes > 0 ? (
                            <>
                              <div className="font-medium text-gray-900">
                                {stop.estimated_time_minutes} min
                              </div>
                              <div className="text-gray-500 text-xs">
                                @ 30 km/h avg
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {stop.activity}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Route Statistics */}
        {routeStats && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Route Statistics & Future Enhancements
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Current Route Analysis</h4>
                <div className="space-y-1">
                  <div>GN areas visited: <strong>{routeStats.gnStopsCount}</strong></div>
                  <div>Longest segment: <strong>{routeStats.longestSegment.toFixed(2)} km</strong></div>
                  <div>Average segment: <strong>{routeStats.averageSegmentDistance.toFixed(2)} km</strong></div>
                  <div>Risk distribution: 
                    {Object.entries(routeStats.riskLevelCounts).map(([level, count]) => 
                      ` ${level}: ${count}`
                    ).join(',')}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Enhancement Roadmap</h4>
                <div className="space-y-1">
                  <div>📅 <strong>Phase 1:</strong> Current Haversine-based routing</div>
                  <div>🛣️ <strong>Phase 2:</strong> Google Maps Roads API integration</div>
                  <div>🚦 <strong>Phase 3:</strong> Real-time traffic optimization</div>
                  <div>👥 <strong>Phase 4:</strong> Multi-team route coordination</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Integration Ready:</strong> The route planning system is designed to easily integrate with 
                real routing services. Simply replace the Haversine distance calculations with API calls to 
                Google Maps, OpenRouteService, or Mapbox for production-ready turn-by-turn routing.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutePlanning;