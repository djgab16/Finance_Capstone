import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './StaticMapBox.css';

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface StaticMapBoxProps {
  location: { lat: number; lng: number };
}

// Helper component to center map on new location
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function StaticMapBox({ location }: StaticMapBoxProps) {
  const position: [number, number] = [location.lat, location.lng];

  return (
    <div className="static-map-wrapper">
      <div className="map-header">
        <h3>Last Known Location</h3>
        <span className="live-indicator">
          <span className="pulse-dot"></span> Static Pin View
        </span>
      </div>
      
      <div className="leaflet-container-override">
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={false}
          dragging={false} // Disable dragging to keep it "static"
          zoomControl={false} // Disable zoom
          style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={position} />
          <Marker position={position}>
            <Popup>
              Latest Scan Location
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      
      <div className="map-footer-note">
        * Location represents the area of the last tracking scan, not live GPS.
      </div>
    </div>
  );
}
