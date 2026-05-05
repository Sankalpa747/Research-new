import { useState, useEffect } from 'react';
import { pilotAPI } from '../services/api';

/**
 * Hook for loading pilot hotspot data for map visualization
 * Provides GN-level risk scores and levels for polygon coloring
 */
export const useHotspotData = () => {
  const [hotspotData, setHotspotData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadHotspotData();
  }, []);

  const loadHotspotData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await pilotAPI.getPilotHotspots();
      const hotspots = response.data.hotspots || [];
      
      setHotspotData(hotspots);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Failed to load hotspot data');
      console.error('Error loading hotspot data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getHotspotByGNCode = (gnCode) => {
    return hotspotData.find(hotspot => hotspot.gn_code === gnCode);
  };

  const getRiskLevel = (gnCode) => {
    const hotspot = getHotspotByGNCode(gnCode);
    return hotspot?.risk_level || 'Unknown';
  };

  const getRiskScore = (gnCode) => {
    const hotspot = getHotspotByGNCode(gnCode);
    return hotspot?.risk_score || 0;
  };

  const getRiskRank = (gnCode) => {
    const hotspot = getHotspotByGNCode(gnCode);
    return hotspot?.priority_rank || null;
  };

  const getHotspotSummary = (gnCode) => {
    const hotspot = getHotspotByGNCode(gnCode);
    if (!hotspot) return null;

    return {
      gn_code: hotspot.gn_code,
      gn_name: hotspot.gn_name,
      risk_level: hotspot.risk_level,
      risk_score: hotspot.risk_score,
      priority_rank: hotspot.priority_rank,
      confirmed_cases: hotspot.confirmed_cases,
      breeding_sites: hotspot.breeding_sites,
      environmental_complaints: hotspot.environmental_complaints,
      flagged_inspections: hotspot.flagged_inspections,
      population: hotspot.population,
      report_count: hotspot.report_count
    };
  };

  // Color mapping for risk levels
  const getRiskLevelColors = () => {
    return {
      'High': {
        fill: '#EF4444',      // Red-500
        border: '#DC2626',    // Red-600
        fillOpacity: 0.7
      },
      'Medium': {
        fill: '#F59E0B',      // Amber-500
        border: '#D97706',    // Amber-600
        fillOpacity: 0.6
      },
      'Low': {
        fill: '#10B981',      // Emerald-500
        border: '#059669',    // Emerald-600
        fillOpacity: 0.5
      },
      'Unknown': {
        fill: '#6B7280',      // Gray-500
        border: '#4B5563',    // Gray-600
        fillOpacity: 0.3
      }
    };
  };

  const getPolygonStyle = (gnCode, isSelected = false, isHovered = false) => {
    const riskLevel = getRiskLevel(gnCode);
    const colors = getRiskLevelColors()[riskLevel] || getRiskLevelColors()['Unknown'];
    
    let style = {
      fillColor: colors.fill,
      color: colors.border,
      weight: 2,
      opacity: 1,
      fillOpacity: colors.fillOpacity
    };

    // Apply selection style
    if (isSelected) {
      style.weight = 4;
      style.fillOpacity = Math.min(colors.fillOpacity + 0.2, 0.9);
    }

    // Apply hover style
    if (isHovered) {
      style.weight = 3;
      style.fillOpacity = Math.min(colors.fillOpacity + 0.1, 0.8);
    }

    return style;
  };

  // Statistics
  const getStats = () => {
    const total = hotspotData.length;
    const highRisk = hotspotData.filter(h => h.risk_level === 'High').length;
    const mediumRisk = hotspotData.filter(h => h.risk_level === 'Medium').length;
    const lowRisk = hotspotData.filter(h => h.risk_level === 'Low').length;
    
    const topScore = hotspotData.length > 0 ? Math.max(...hotspotData.map(h => h.risk_score)) : 0;
    const avgScore = hotspotData.length > 0 
      ? hotspotData.reduce((sum, h) => sum + h.risk_score, 0) / hotspotData.length 
      : 0;

    return {
      total,
      highRisk,
      mediumRisk,
      lowRisk,
      topScore,
      avgScore: Math.round(avgScore * 10) / 10
    };
  };

  return {
    hotspotData,
    loading,
    error,
    lastUpdated,
    reload: loadHotspotData,
    // Helper functions
    getHotspotByGNCode,
    getRiskLevel,
    getRiskScore,
    getRiskRank,
    getHotspotSummary,
    getRiskLevelColors,
    getPolygonStyle,
    getStats
  };
};