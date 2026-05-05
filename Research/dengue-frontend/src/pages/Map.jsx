import { useState } from 'react';
import { MapPin, Layers, Info, MousePointer, AlertTriangle, Palette, RefreshCw, Navigation, Route } from 'lucide-react';
import BaseMap from '../components/maps/BaseMap';
import GNBoundaries from '../components/maps/GNBoundaries';
import HotspotLegend from '../components/maps/HotspotLegend';
import RouteVisualization from '../components/maps/RouteVisualization';
import { useGNBoundaries } from '../hooks/useGNBoundaries';
import { useHotspotData } from '../hooks/useHotspotData';
import { useRouteData } from '../hooks/useRouteData';
import '../styles/hotspot-map.css';

const Map = () => {
  const [mapInfo] = useState({
    center: [6.9271, 79.8612], // Colombo coordinates
    zoom: 13, // Increased zoom to better show GN boundaries
    city: "Colombo, Sri Lanka"
  });
  
  const [selectedGN, setSelectedGN] = useState(null);
  const [hotspotColoringEnabled, setHotspotColoringEnabled] = useState(true);
  const [routeDisplayEnabled, setRouteDisplayEnabled] = useState(false);
  
  const { boundaryData, loading: boundariesLoading, error: boundariesError, getAllGNCodes } = useGNBoundaries();
  const { 
    hotspotData, 
    loading: hotspotLoading, 
    error: hotspotError, 
    lastUpdated, 
    reload: reloadHotspotData,
    getStats,
    getHotspotSummary 
  } = useHotspotData();
  const {
    routeData,
    loading: routeLoading,
    error: routeError,
    reload: reloadRouteData
  } = useRouteData();
  
  const handleGNClick = (gnCode, gnProperties) => {
    setSelectedGN(gnCode);
    console.log('Selected GN:', gnCode, gnProperties);
    
    // If hotspot data is available, log it too
    if (gnProperties.hotspot) {
      console.log('Hotspot data:', gnProperties.hotspot);
    }
  };
  
  const availableGNs = getAllGNCodes();
  const hotspotStats = getStats();
  const selectedGNHotspot = selectedGN ? getHotspotSummary(selectedGN) : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dengue Hotspot Map
          </h2>
          <p className="text-gray-600">
            Interactive map showing GN-level dengue risk visualization for Colombo pilot areas
          </p>
        </div>
        
        {/* Map Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setHotspotColoringEnabled(!hotspotColoringEnabled)}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              hotspotColoringEnabled 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            <Palette className="w-4 h-4 mr-2" />
            {hotspotColoringEnabled ? 'Hotspot Colors' : 'Basic Colors'}
          </button>
          
          <button
            onClick={() => setRouteDisplayEnabled(!routeDisplayEnabled)}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              routeDisplayEnabled 
                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            <Navigation className="w-4 h-4 mr-2" />
            {routeDisplayEnabled ? 'Show Route' : 'Hide Route'}
          </button>
          
          <button
            onClick={() => {
              reloadHotspotData();
              reloadRouteData();
            }}
            disabled={hotspotLoading || routeLoading}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(hotspotLoading || routeLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Hotspot Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="font-medium text-red-800">High Risk</h3>
            </div>
            <span className="text-2xl font-bold text-red-900">
              {hotspotStats?.highRisk || 0}
            </span>
          </div>
          <p className="text-sm text-red-700">Areas needing immediate attention</p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <h3 className="font-medium text-yellow-800">Medium Risk</h3>
            </div>
            <span className="text-2xl font-bold text-yellow-900">
              {hotspotStats?.mediumRisk || 0}
            </span>
          </div>
          <p className="text-sm text-yellow-700">Preventive measures needed</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Info className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-medium text-green-800">Low Risk</h3>
            </div>
            <span className="text-2xl font-bold text-green-900">
              {hotspotStats?.lowRisk || 0}
            </span>
          </div>
          <p className="text-sm text-green-700">Maintain current prevention</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <MousePointer className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-blue-800">Selected Area</h3>
            </div>
            {selectedGNHotspot && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                selectedGNHotspot.risk_level === 'High' ? 'bg-red-100 text-red-800' :
                selectedGNHotspot.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {selectedGNHotspot.risk_level}
              </span>
            )}
          </div>
          <p className="text-sm text-blue-700">
            {selectedGN ? (
              selectedGNHotspot ? (
                <>
                  {selectedGNHotspot.gn_name}
                  <br />
                  <span className="font-mono text-xs">Score: {selectedGNHotspot.risk_score}</span>
                </>
              ) : (
                `${selectedGN} (Loading...)`
              )
            ) : (
              'Click a GN area to select'
            )}
          </p>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Interactive Hotspot Map
            </h3>
            <p className="text-sm text-gray-600">
              GN polygons are colored by dengue risk level. Click any area to see detailed risk information.
            </p>
          </div>
          
          {/* Map Status */}
          <div className="text-sm text-gray-500">
            {hotspotLoading && (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                Loading hotspot data...
              </span>
            )}
            {hotspotError && (
              <span className="text-red-600">Error loading hotspot data</span>
            )}
            {!hotspotLoading && !hotspotError && hotspotData.length > 0 && (
              <span className="text-green-600">
                ✓ {hotspotData.length} areas with risk data
              </span>
            )}
          </div>
        </div>
        
        {/* Map Component */}
        <div className="relative">
          <BaseMap
            center={mapInfo.center}
            zoom={mapInfo.zoom}
            height="600px"
            className="border border-gray-200 rounded-lg"
          >
            {/* GN Boundary Polygons with Hotspot Coloring */}
            <GNBoundaries 
              onGNClick={handleGNClick}
              selectedGN={selectedGN}
              showLabels={true}
              enableHotspotColoring={hotspotColoringEnabled}
            />
            
            {/* Route Visualization Overlay */}
            {routeDisplayEnabled && routeData && (
              <RouteVisualization
                routeData={routeData}
                showRoute={true}
                showMarkers={true}
                showStopNumbers={true}
              />
            )}
          </BaseMap>
          
          {/* Legends */}
          <div className="absolute top-4 right-4 space-y-4 z-[1000]">
            {/* Hotspot Legend */}
            {hotspotColoringEnabled && (
              <HotspotLegend 
                stats={hotspotStats}
                lastUpdated={lastUpdated}
                loading={hotspotLoading}
              />
            )}
            
            {/* Route Legend */}
            {routeDisplayEnabled && routeData && (
              <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
                <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                  <Navigation className="w-4 h-4 mr-2" />
                  Route Plan
                </h3>
                
                {routeLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Loading...</span>
                  </div>
                ) : routeError ? (
                  <div className="text-sm text-red-600">Error loading route</div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      <span>Depot</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-1 bg-blue-600"></div>
                      <span>Route Path</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center font-bold">1</div>
                      <span>Stop Numbers</span>
                    </div>
                    {routeData.summary && (
                      <div className="pt-2 mt-2 border-t border-gray-200 space-y-1 text-xs text-gray-600">
                        <div>Distance: {routeData.summary.total_distance_km} km</div>
                        <div>Time: {routeData.summary.estimated_travel_time_hours}h</div>
                        <div>Stops: {routeData.summary.total_stops}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Usage Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-3 flex items-center">
          <Info className="w-4 h-4 mr-2" />
          How to Use the Hotspot Map
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <strong>Understanding Colors:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li><span className="inline-block w-3 h-3 bg-red-500 rounded mr-2"></span>Red = High risk (immediate action needed)</li>
              <li><span className="inline-block w-3 h-3 bg-yellow-500 rounded mr-2"></span>Yellow = Medium risk (preventive measures)</li>
              <li><span className="inline-block w-3 h-3 bg-green-500 rounded mr-2"></span>Green = Low risk (maintain prevention)</li>
            </ul>
          </div>
          <div>
            <strong>Interactions:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Click any GN area to see detailed risk data</li>
              <li>Hover for quick information popup</li>
              <li>Use "Hotspot Colors" toggle to enable/disable coloring</li>
              <li>Click "Refresh" to update with latest data</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Status */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Data Status & Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Boundary Data Status */}
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Map Boundaries</h5>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={boundariesLoading ? 'text-yellow-600' : 'text-green-600'}>
                  {boundariesLoading ? 'Loading...' : '✓ Loaded'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Available GNs:</span>
                <span>{availableGNs.length > 0 ? availableGNs.join(', ') : 'Loading...'}</span>
              </div>
              {boundariesError && (
                <div className="text-red-600 text-xs">Error: {boundariesError}</div>
              )}
            </div>
          </div>
          
          {/* Hotspot Data Status */}
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Hotspot Data</h5>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={hotspotLoading ? 'text-yellow-600' : hotspotError ? 'text-red-600' : 'text-green-600'}>
                  {hotspotLoading ? 'Loading...' : hotspotError ? '⚠ Error' : '✓ Loaded'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Risk Areas:</span>
                <span>{hotspotData.length} GNs</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span>{lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}</span>
              </div>
              {hotspotError && (
                <div className="text-red-600 text-xs">Error: {hotspotError}</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Selected GN Info */}
        {selectedGN && selectedGNHotspot && (
          <div className="mt-4 p-3 bg-white rounded border">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-gray-900">Selected: {selectedGNHotspot.gn_name}</h5>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                selectedGNHotspot.risk_level === 'High' ? 'bg-red-100 text-red-800' :
                selectedGNHotspot.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {selectedGNHotspot.risk_level} Risk - Rank #{selectedGNHotspot.priority_rank}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
              <div>Score: <strong>{selectedGNHotspot.risk_score}</strong></div>
              <div>Cases: <strong>{selectedGNHotspot.confirmed_cases}</strong></div>
              <div>Sites: <strong>{selectedGNHotspot.breeding_sites}</strong></div>
              <div>Reports: <strong>{selectedGNHotspot.report_count}</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Implementation Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h4 className="font-medium text-green-900 mb-3 flex items-center">
          <Info className="w-4 h-4 mr-2" />
          Map Implementation Status
        </h4>
        <div className="space-y-2 text-sm text-green-800">
          <div className="flex items-start">
            <span className="font-medium mr-2 text-green-600">✓</span>
            <span className="line-through text-gray-600">Add GeoJSON layer for pilot GN boundaries</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium mr-2 text-green-600">✓</span>
            <span className="line-through text-gray-600">Implement hotspot color coding system</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium mr-2 text-green-600">✓</span>
            <span className="line-through text-gray-600">Add interactive legend and risk information</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium mr-2 text-green-600">✓</span>
            <span className="line-through text-gray-600">Enable click interactions with detailed popups</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium mr-2 text-blue-600">→</span>
            <span>Next: Connect GN selection to data entry forms</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium mr-2 text-blue-600">→</span>
            <span>Next: Add route visualization for field teams</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-white rounded border border-green-300">
          <p className="text-sm text-green-800">
            <strong>Hotspot visualization is now complete!</strong> The map displays real-time risk levels using data from the pilot hotspot scoring system. Colors automatically update when new reports are submitted.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Map;