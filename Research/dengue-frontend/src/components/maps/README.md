# Maps Components

This directory contains mapping components for the dengue surveillance system.

## Map Library: Leaflet + React Leaflet

**Dependencies added to package.json:**
- `leaflet: ^1.9.4` - Core mapping library
- `react-leaflet: ^4.2.1` - React wrapper for Leaflet

**CSS added to index.html:**
- Leaflet CSS from CDN for proper map styling

## BaseMap Component

The foundation map component that provides:

### Features
- OpenStreetMap tile layer
- Configurable center coordinates (defaults to Colombo)
- Adjustable zoom level
- Responsive container
- Default marker with popup
- Support for additional children (markers, polygons, etc.)

### Usage

```jsx
import BaseMap from '../components/maps/BaseMap';

function MyComponent() {
  return (
    <BaseMap
      center={[6.9271, 79.8612]} // Colombo coordinates
      zoom={12}
      height="500px"
      className="border border-gray-200"
    >
      {/* Add additional map elements here */}
    </BaseMap>
  );
}
```

### Props
- `center` - Array of [latitude, longitude] (default: Colombo)
- `zoom` - Initial zoom level (default: 12)
- `height` - Container height (default: "400px")
- `className` - Additional CSS classes
- `children` - Additional map components (markers, layers, etc.)

## Map Page

Located at `/map` route, provides:
- Basic map demonstration
- Map controls information
- Next implementation steps
- Status indicators

## GNBoundaries Component

Displays GN boundary polygons from local GeoJSON file.

### Features
- Loads pilot GN boundaries from `/data/pilot_gn_boundaries.geojson`
- Interactive polygon selection
- Hover effects and popups
- Configurable styling based on selection state

### Usage

```jsx
import GNBoundaries from '../components/maps/GNBoundaries';

<BaseMap>
  <GNBoundaries 
    onGNClick={(gnCode, properties) => handleGNSelection(gnCode)}
    selectedGN={selectedGNCode}
    showLabels={true}
  />
</BaseMap>
```

### Props
- `onGNClick` - Callback function when GN polygon is clicked
- `selectedGN` - Currently selected GN code for highlighting
- `showLabels` - Show popups with GN information (default: true)

## useGNBoundaries Hook

Provides boundary data and helper functions.

### Usage
```jsx
import { useGNBoundaries } from '../../hooks/useGNBoundaries';

const { boundaryData, loading, error, getAllGNCodes, getGNBounds } = useGNBoundaries();
```

## Next Steps

1. **✅ GeoJSON Layer**: Add pilot GN boundaries from `pilot_gn_boundaries.geojson`
2. **Hotspot Coloring**: Color-code GN areas based on risk levels  
3. **Interactive Markers**: Add clickable markers for data entry points
4. **Route Visualization**: Display field team routes

## Data Files

### GeoJSON Boundaries
**Location**: `public/data/pilot_gn_boundaries.geojson`
**Access URL**: `/data/pilot_gn_boundaries.geojson`
**Contains**: 3 polygon features for pilot GN divisions

## Coordinates Reference

- **Colombo Center**: [6.9271, 79.8612]
- **Kollupitiya**: [6.915, 79.848] (CMB-GN-01)
- **Bambalapitiya**: [6.894, 79.855] (CMB-GN-02)  
- **Wellawatte**: [6.875, 79.8615] (CMB-GN-03)

## Troubleshooting

### Map not displaying
1. Check that Leaflet CSS is loaded in index.html
2. Ensure container has proper height
3. Verify dependencies are installed

### Markers not showing
- Issue is fixed in BaseMap.jsx with proper icon URLs

### Performance
- OpenStreetMap tiles are free but have usage limits
- Consider switching to other tile providers if needed