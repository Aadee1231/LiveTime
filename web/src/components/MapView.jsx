import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEventAttendance } from '../hooks/useEventAttendance';
import { useAuth } from '../contexts/AuthContext';
import { useEventModal } from '../contexts/EventModalContext';
import { getEventStatus } from '../lib/eventUtils';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

// Custom marker icons
const createCustomIcon = (status, isSelected) => {
  const colors = {
    live: isSelected ? '#dc2626' : '#ef4444',
    soon: isSelected ? '#d97706' : '#f59e0b',
    default: isSelected ? '#7e22ce' : '#9333ea'
  };
  
  const color = colors[status] || colors.default;
  const size = isSelected ? 40 : 32;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-pin ${status} ${isSelected ? 'selected' : ''}" style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        position: relative;
        transition: all 0.2s ease;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${size * 0.4}px;
          height: ${size * 0.4}px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
};

function EventPopup({ event }) {
  const { user } = useAuth();
  const { openEventModal } = useEventModal();
  const { attendeeCount } = useEventAttendance(event.id, user?.id);
  const eventStatus = getEventStatus(event.start_time, event.end_time);

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

  const handleViewDetails = () => {
    openEventModal(event);
  };

  const renderStatusBadge = () => {
    if (eventStatus === 'live') {
      return <span className="event-status-badge live">🔴 Live Now</span>;
    }
    if (eventStatus === 'soon') {
      return <span className="event-status-badge soon">⏰ Starting Soon</span>;
    }
    return null;
  };

  return (
    <div className="map-popup">
      <div className="popup-header">
        <h4>{event.title}</h4>
        {renderStatusBadge()}
      </div>
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
      <button className="popup-view-btn" onClick={handleViewDetails}>
        View Details
      </button>
    </div>
  );
}

function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom, { animate: true, duration: 0.5 });
    }
  }, [center, zoom, map]);
  
  return null;
}

export default function MapView({ events, selectedEventId, onMarkerClick, mapCenter, mapZoom }) {
  const ncStateCenter = [35.7847, -78.6821];
  const markerRefs = useRef({});

  const validEvents = events.filter(event => 
    event.location_lat && event.location_lng
  );

  useEffect(() => {
    if (selectedEventId && markerRefs.current[selectedEventId]) {
      markerRefs.current[selectedEventId].openPopup();
    }
  }, [selectedEventId]);

  const handleMarkerClick = (event) => {
    if (onMarkerClick) {
      onMarkerClick(event.id);
    }
  };

  return (
    <MapContainer
      center={mapCenter || ncStateCenter}
      zoom={mapZoom || 14}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapController center={mapCenter} zoom={mapZoom} />
      
      {validEvents.map(event => {
        const eventStatus = getEventStatus(event.start_time, event.end_time);
        const isSelected = selectedEventId === event.id;
        
        return (
          <Marker
            key={event.id}
            position={[event.location_lat, event.location_lng]}
            icon={createCustomIcon(eventStatus, isSelected)}
            eventHandlers={{
              click: () => handleMarkerClick(event)
            }}
            ref={(ref) => {
              if (ref) {
                markerRefs.current[event.id] = ref;
              }
            }}
          >
            <Popup>
              <EventPopup event={event} />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
