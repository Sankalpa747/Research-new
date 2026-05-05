import { useState, useEffect } from 'react';
import { pilotAPI } from '../services/api';

/**
 * Hook for loading pilot route planning data for map visualization
 * Provides route stops, coordinates, and planning information
 */
export const useRouteData = () => {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadRouteData();
  }, []);

  const loadRouteData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await pilotAPI.getPilotRoutePlan();
      
      setRouteData(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Failed to load route data');
      console.error('Error loading route data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getRouteStops = () => {
    return routeData?.route_stops || [];
  };

  const getRouteCoordinates = () => {
    return routeData?.route_coordinates || [];
  };

  const getDepotLocation = () => {
    return routeData?.depot || null;
  };

  const getRouteSummary = () => {
    return routeData?.summary || null;
  };

  const getGNStops = () => {
    return getRouteStops().filter(stop => stop.location_type === 'gn_area');
  };

  const getStopByOrder = (order) => {
    return getRouteStops().find(stop => stop.stop_order === order);
  };

  const getStopByGNCode = (gnCode) => {
    return getRouteStops().find(stop => stop.location_code === gnCode);
  };

  const getTotalDistance = () => {
    return routeData?.summary?.total_distance_km || 0;
  };

  const getTotalTime = () => {
    return routeData?.summary?.estimated_travel_time_hours || 0;
  };

  // Calculate route bounds for map fitting
  const getRouteBounds = () => {
    const coordinates = getRouteCoordinates();
    if (coordinates.length === 0) return null;
    
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    
    coordinates.forEach(([lat, lng]) => {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });
    
    return {
      southwest: [minLat, minLng],
      northeast: [maxLat, maxLng],
      center: [(minLat + maxLat) / 2, (minLng + maxLng) / 2]
    };
  };

  // Generate route statistics
  const getRouteStats = () => {
    const stops = getRouteStops();
    const gnStops = getGNStops();
    
    if (stops.length === 0) return null;
    
    const riskCounts = gnStops.reduce((acc, stop) => {
      const level = stop.risk_level || 'Unknown';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalStops: stops.length,
      gnStopsCount: gnStops.length,
      depotStops: stops.filter(stop => 
        stop.location_type === 'depot' || stop.location_type === 'depot_return'
      ).length,
      riskLevelCounts: riskCounts,
      longestSegment: Math.max(...stops.map(stop => stop.distance_from_previous || 0)),
      averageSegmentDistance: gnStops.length > 0 
        ? stops.reduce((sum, stop) => sum + (stop.distance_from_previous || 0), 0) / stops.length 
        : 0
    };
  };

  return {
    routeData,
    loading,
    error,
    lastUpdated,
    reload: loadRouteData,
    // Helper functions
    getRouteStops,
    getRouteCoordinates,
    getDepotLocation,
    getRouteSummary,
    getGNStops,
    getStopByOrder,
    getStopByGNCode,
    getTotalDistance,
    getTotalTime,
    getRouteBounds,
    getRouteStats
  };
};