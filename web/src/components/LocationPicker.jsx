import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapClickHandler({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({ onLocationSelect, initialPosition }) {
  const ncStateCenter = [35.7847, -78.6821];
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="location-picker">
      <button
        type="button"
        className="map-toggle-btn"
        onClick={() => setShowMap(!showMap)}
      >
        {showMap ? '📍 Hide Map' : '🗺️ Pick Location on Map'}
      </button>

      {showMap && (
        <div className="map-picker-container">
          <p className="map-hint">Click anywhere on the map to set location</p>
          <MapContainer
            center={initialPosition || ncStateCenter}
            zoom={14}
            style={{ height: '250px', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onLocationSelect={onLocationSelect} />
            {initialPosition && <Marker position={initialPosition} />}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
