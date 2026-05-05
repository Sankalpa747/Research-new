import { Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Clock, Route } from 'lucide-react';

// Custom marker icons for different stop types
const createCustomIcon = (color, iconType) => {
  const iconHtml = iconType === 'depot' 
    ? `<div style="background: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`
    : `<div style="background: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-route-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

const RouteVisualization = ({ routeData, showRoute = true, showMarkers = true, showStopNumbers = true }) => {
  if (!routeData || !routeData.route_stops || routeData.route_stops.length === 0) {
    return null;
  }

  const { route_stops, route_coordinates } = routeData;

  // Color scheme for different stop types and risk levels
  const getStopColor = (stop) => {
    if (stop.location_type === 'depot' || stop.location_type === 'depot_return') {
      return '#10B981'; // Green for depot
    }
    
    switch (stop.risk_level) {
      case 'High': return '#EF4444';   // Red
      case 'Medium': return '#F59E0B'; // Amber/Orange  
      case 'Low': return '#10B981';    // Green
      default: return '#6B7280';       // Gray
    }
  };

  // Generate different colors for route segments
  const getSegmentColor = (index, total) => {
    // Gradient from blue to purple for route segments
    const hue = 240 - (index / total) * 60; // From 240 (blue) to 180 (cyan/teal)
    return `hsl(${hue}, 70%, 50%)`;
  };

  return (
    <>
      {/* Route Polylines */}
      {showRoute && route_coordinates && route_coordinates.length > 1 && (
        <>
          {/* Main route line */}
          <Polyline
            positions={route_coordinates}
            color="#2563EB"
            weight={4}
            opacity={0.8}
            dashArray="0"
          />
          
          {/* Individual segments with different colors */}
          {route_coordinates.map((coord, index) => {
            if (index === 0) return null;
            
            const prevCoord = route_coordinates[index - 1];
            const segmentColor = getSegmentColor(index - 1, route_coordinates.length - 1);
            
            return (
              <Polyline
                key={`segment-${index}`}
                positions={[prevCoord, coord]}
                color={segmentColor}
                weight={2}
                opacity={0.6}
                dashArray="5,5"
              />
            );
          })}
        </>
      )}

      {/* Route Markers */}
      {showMarkers && route_stops.map((stop, index) => {
        const stopColor = getStopColor(stop);
        const iconType = stop.location_type === 'depot' || stop.location_type === 'depot_return' ? 'depot' : 'stop';
        const customIcon = createCustomIcon(stopColor, iconType);

        return (
          <Marker
            key={`${stop.location_code}-${stop.stop_order}`}
            position={[stop.latitude, stop.longitude]}
            icon={customIcon}
          >
            <Popup maxWidth={300} className="route-stop-popup">
              <div className="font-sans">
                {/* Header */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">
                      {stop.location_name}
                    </h3>
                    <span className="text-xs text-gray-500 font-mono">
                      {stop.location_code}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Stop #{stop.stop_order}
                    </span>
                    {stop.risk_level && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        stop.risk_level === 'High' ? 'bg-red-100 text-red-800' :
                        stop.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {stop.risk_level} Risk
                      </span>
                    )}
                  </div>
                </div>

                {/* Activity */}
                <div className="mb-3">
                  <div className="flex items-start space-x-2">
                    <Navigation className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Activity:</div>
                      <div className="text-sm text-gray-800">{stop.activity}</div>
                    </div>
                  </div>
                </div>

                {/* Distance & Time Info */}
                {stop.distance_from_previous > 0 && (
                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-gray-200 pt-2">
                    <div className="flex items-center space-x-1">
                      <Route className="w-3 h-3 text-gray-400" />
                      <div>
                        <div className="text-gray-500">Distance:</div>
                        <div className="font-medium text-gray-800">
                          {stop.distance_from_previous} km
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <div>
                        <div className="text-gray-500">Travel Time:</div>
                        <div className="font-medium text-gray-800">
                          {stop.estimated_time_minutes} min
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Risk Information */}
                {stop.risk_score && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Risk Details:</div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-800">Score: {stop.risk_score}</span>
                      {stop.priority_rank && (
                        <span className="ml-2 text-gray-600">• Rank #{stop.priority_rank}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Coordinates (for debugging) */}
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                  {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Stop Number Labels */}
      {showStopNumbers && route_stops.map((stop, index) => (
        <Marker
          key={`label-${stop.location_code}-${stop.stop_order}`}
          position={[stop.latitude + 0.002, stop.longitude + 0.002]} // Slight offset for visibility
          icon={L.divIcon({
            html: `<div style="background: rgba(59, 130, 246, 0.9); color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">${stop.stop_order}</div>`,
            className: 'route-number-label',
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          })}
        />
      ))}
    </>
  );
};

export default RouteVisualization;