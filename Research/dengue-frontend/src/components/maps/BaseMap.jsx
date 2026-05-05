import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const BaseMap = ({ 
  center = [6.9271, 79.8612], // Colombo, Sri Lanka coordinates
  zoom = 12,
  height = "400px",
  className = "",
  showCenterMarker = false,
  children
}) => {
  return (
    <div className={`relative ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      >
        {/* OpenStreetMap tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Optional center marker */}
        {showCenterMarker && (
          <Marker position={center}>
            <Popup>
              <div className="text-center">
                <strong>Colombo</strong><br />
                Map center point
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Any additional children (markers, polygons, etc.) */}
        {children}
      </MapContainer>
    </div>
  );
};

export default BaseMap;