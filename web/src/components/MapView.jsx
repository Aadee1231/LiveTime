import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEventAttendance } from '../hooks/useEventAttendance';
import { useAuth } from '../contexts/AuthContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function EventPopup({ event }) {
  const { user } = useAuth();
  const { attendeeCount } = useEventAttendance(event.id, user?.id);

  const formatEventTime = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const startTimeStr = start.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    const endTimeStr = end.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    return `${startTimeStr} - ${endTimeStr}`;
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="map-popup">
      <h4>{event.title}</h4>
      {event.club_name && (
        <p style={{ margin: '0.25rem 0', fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>
          {event.club_name}
        </p>
      )}
      <p className="popup-time">{formatEventTime(event.start_time, event.end_time)}</p>
      <p className="popup-description">{truncateText(event.description)}</p>
      <p className="popup-location">📍 {event.location_address}</p>
      {attendeeCount > 0 && (
        <p className="popup-attendees">{attendeeCount} going</p>
      )}
    </div>
  );
}

export default function MapView({ events }) {
  const ncStateCenter = [35.7847, -78.6821];

  const liveEvents = events.filter(event => {
    if (!event.location_lat || !event.location_lng) return false;
    
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    return (now >= startTime && now <= endTime) || (startTime <= oneHourFromNow && startTime > now);
  });

  return (
    <MapContainer
      center={ncStateCenter}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {liveEvents.map(event => (
        <Marker
          key={event.id}
          position={[event.location_lat, event.location_lng]}
        >
          <Popup>
            <EventPopup event={event} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
