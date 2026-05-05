import { useState, useEffect } from 'react';

/**
 * Hook for loading GN boundary data from local GeoJSON file
 * Provides boundary data for map components and form integration
 */
export const useGNBoundaries = () => {
  const [boundaryData, setBoundaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBoundaryData();
  }, []);

  const loadBoundaryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load GeoJSON from public folder
      const response = await fetch('/data/pilot_gn_boundaries.geojson');
      if (!response.ok) {
        throw new Error(`Failed to load boundary data: ${response.status}`);
      }
      
      const data = await response.json();
      setBoundaryData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading GN boundaries:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getGNFeature = (gnCode) => {
    if (!boundaryData?.features) return null;
    return boundaryData.features.find(feature => 
      feature.properties.gn_code === gnCode
    );
  };

  const getGNBounds = (gnCode) => {
    const feature = getGNFeature(gnCode);
    if (!feature?.geometry?.coordinates) return null;
    
    // Calculate bounding box from polygon coordinates
    const coords = feature.geometry.coordinates[0];
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    
    coords.forEach(([lng, lat]) => {
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

  const getAllGNCodes = () => {
    if (!boundaryData?.features) return [];
    return boundaryData.features.map(feature => feature.properties.gn_code);
  };

  const getGNProperties = (gnCode) => {
    const feature = getGNFeature(gnCode);
    return feature?.properties || null;
  };

  return {
    boundaryData,
    loading,
    error,
    reload: loadBoundaryData,
    // Helper functions
    getGNFeature,
    getGNBounds,
    getAllGNCodes,
    getGNProperties
  };
};