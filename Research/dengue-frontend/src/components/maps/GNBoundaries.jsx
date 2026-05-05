import { GeoJSON, Popup } from 'react-leaflet';
import { useState } from 'react';
import { useGNBoundaries } from '../../hooks/useGNBoundaries';
import { useHotspotData } from '../../hooks/useHotspotData';

const GNBoundaries = ({ 
  onGNClick = null, 
  selectedGN = null,
  showLabels = true,
  enableHotspotColoring = true
}) => {
  const { boundaryData, loading: boundaryLoading, error: boundaryError } = useGNBoundaries();
  const { getPolygonStyle: getHotspotStyle, getHotspotSummary, loading: hotspotLoading } = useHotspotData();
  const [hoveredGN, setHoveredGN] = useState(null);

  // Enhanced style function that uses hotspot data
  const getPolygonStyle = (feature) => {
    const gnCode = feature.properties.gn_code;
    const isSelected = selectedGN === gnCode;
    const isHovered = hoveredGN === gnCode;
    
    // Use hotspot-based coloring if enabled and data is available
    if (enableHotspotColoring && !hotspotLoading) {
      return getHotspotStyle(gnCode, isSelected, isHovered);
    }
    
    // Fallback to original styling
    return {
      fillColor: isSelected ? '#3B82F6' : '#10B981',
      weight: isSelected ? 3 : 2,
      opacity: 1,
      color: isSelected ? '#1D4ED8' : '#059669',
      dashArray: '',
      fillOpacity: isSelected ? 0.8 : 0.6
    };
  };

  // Handle feature interactions
  const onEachFeature = (feature, layer) => {
    const { gn_code, gn_name, city, is_synthetic_boundary } = feature.properties;
    
    // Create enhanced popup content with hotspot information
    if (showLabels) {
      const hotspotInfo = getHotspotSummary(gn_code);
      
      let popupContent;
      
      if (hotspotInfo && !hotspotLoading) {
        // Enhanced popup with hotspot data
        const riskColor = hotspotInfo.risk_level === 'High' ? '#EF4444' : 
                         hotspotInfo.risk_level === 'Medium' ? '#F59E0B' : '#10B981';
        
        popupContent = `
          <div style="font-family: sans-serif; min-width: 200px;">
            <div style="text-align: center; margin-bottom: 8px;">
              <strong style="color: #1F2937; font-size: 16px;">${gn_name}</strong><br>
              <span style="color: #6B7280; font-size: 12px; font-family: monospace;">${gn_code}</span>
            </div>
            
            <div style="background: ${riskColor}20; border-left: 3px solid ${riskColor}; padding: 6px; margin: 8px 0;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold; color: ${riskColor}; font-size: 13px;">
                  ${hotspotInfo.risk_level} Risk
                </span>
                <span style="font-size: 11px; color: #6B7280;">
                  Rank #${hotspotInfo.priority_rank}
                </span>
              </div>
              <div style="font-size: 12px; color: #374151; margin-top: 2px;">
                Score: <strong>${hotspotInfo.risk_score}</strong>
              </div>
            </div>
            
            <div style="font-size: 11px; color: #6B7280; line-height: 1.4;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin: 6px 0;">
                <div><strong>${hotspotInfo.confirmed_cases}</strong> cases</div>
                <div><strong>${hotspotInfo.breeding_sites}</strong> sites</div>
                <div><strong>${hotspotInfo.environmental_complaints}</strong> complaints</div>
                <div><strong>${hotspotInfo.flagged_inspections}</strong> flagged</div>
              </div>
              ${hotspotInfo.population > 0 ? `<div style="margin-top: 4px;">Population: <strong>${hotspotInfo.population.toLocaleString()}</strong></div>` : ''}
              <div style="margin-top: 4px;">Based on <strong>${hotspotInfo.report_count}</strong> reports</div>
            </div>
            
            ${is_synthetic_boundary ? '<div style="text-align: center; margin-top: 6px;"><em style="color: #EF4444; font-size: 9px;">Demo Data</em></div>' : ''}
          </div>
        `;
      } else {
        // Basic popup without hotspot data
        popupContent = `
          <div style="text-align: center; font-family: sans-serif;">
            <strong style="color: #1F2937; font-size: 14px;">${gn_name}</strong><br>
            <span style="color: #6B7280; font-size: 12px;">${gn_code}</span><br>
            <span style="color: #9CA3AF; font-size: 10px;">${city}</span>
            ${hotspotLoading ? '<br><span style="color: #6B7280; font-size: 10px;">Loading hotspot data...</span>' : ''}
            ${is_synthetic_boundary ? '<br><em style="color: #EF4444; font-size: 9px;">Demo Data</em>' : ''}
          </div>
        `;
      }
      
      layer.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'hotspot-popup'
      });
    }

    // Click event - pass enhanced data
    layer.on('click', () => {
      if (onGNClick) {
        const hotspotInfo = getHotspotSummary(gn_code);
        const enhancedProperties = {
          ...feature.properties,
          hotspot: hotspotInfo
        };
        onGNClick(gn_code, enhancedProperties);
      }
    });

    // Hover effects
    layer.on('mouseover', () => {
      setHoveredGN(gn_code);
      layer.setStyle(getPolygonStyle(feature));
    });

    layer.on('mouseout', () => {
      setHoveredGN(null);
      layer.setStyle(getPolygonStyle(feature));
    });
  };

  if (boundaryLoading) {
    return null; // Don't render anything while loading boundaries
  }

  if (boundaryError) {
    console.error('GN Boundaries error:', boundaryError);
    return null; // Fail silently to not break the map
  }

  if (!boundaryData || !boundaryData.features) {
    return null;
  }

  return (
    <GeoJSON
      data={boundaryData}
      style={getPolygonStyle}
      onEachFeature={onEachFeature}
    />
  );
};

export default GNBoundaries;