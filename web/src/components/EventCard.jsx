import { useAuth } from '../contexts/AuthContext';
import { useEventAttendance } from '../hooks/useEventAttendance';
import { getEventStatus } from '../lib/eventUtils';

export default function EventCard({
  eventId,
  title,
  description,
  locationAddress,
  startTime,
  endTime,
  clubName,
  imageUrl,
  variant = 'feed'
}) {
  const { user } = useAuth();
  const { attendees, isGoing, toggleAttendance, attendeeCount } = useEventAttendance(
    eventId,
    user?.id
  );

  const eventStatus = getEventStatus(startTime, endTime);

  const formatEventTime = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (variant === 'compact') {
      const startTimeStr = startDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
      
      const endTimeStr = endDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
      
      return `${startTimeStr} - ${endTimeStr}`;
    }
    
    const dateStr = startDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    const startTimeStr = startDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    const endTimeStr = endDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    return `${dateStr} • ${startTimeStr} - ${endTimeStr}`;
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const visibleAttendees = attendees.slice(0, 5);
  const remainingCount = Math.max(0, attendeeCount - 5);

  const renderAttendeeBubbles = () => (
    <div className="attendee-bubbles">
      {visibleAttendees.map((attendee) => (
        <div 
          key={attendee.id} 
          className="attendee-bubble" 
          title={attendee.profiles?.full_name || 'User'}
        >
          {attendee.profiles?.avatar_url ? (
            <img 
              src={attendee.profiles.avatar_url} 
              alt={attendee.profiles.full_name} 
            />
          ) : (
            <span>{getInitials(attendee.profiles?.full_name)}</span>
          )}
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="attendee-bubble more-count">
          <span>+{remainingCount}</span>
        </div>
      )}
    </div>
  );

  const renderAttendanceButton = () => (
    <button 
      className={`attendance-btn ${isGoing ? 'going' : ''}`}
      onClick={toggleAttendance}
      disabled={!user}
    >
      {isGoing ? 'Going' : "I'm Going"}
    </button>
  );

  const renderStatusBadge = () => {
    if (eventStatus === 'live') {
      return <span className="event-status-badge live">🔴 Live Now</span>;
    }
    if (eventStatus === 'soon') {
      return <span className="event-status-badge soon">⏰ Starting Soon</span>;
    }
    return null;
  };

  if (variant === 'compact') {
    return (
      <div className="event-pin">
        <div className="event-pin-header">
          <h3>{title}</h3>
          {renderStatusBadge()}
        </div>
        {clubName && (
          <p className="club-name" style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>
            {clubName}
          </p>
        )}
        <p className="location">📍 {locationAddress}</p>
        <p className="description">{truncateText(description)}</p>
        <p className="time">{formatEventTime(startTime, endTime)}</p>
        
        <div className="event-attendees">
          {renderAttendeeBubbles()}
          {renderAttendanceButton()}
        </div>
        
        {attendeeCount > 0 && (
          <p className="attendee-count">{attendeeCount} going</p>
        )}
      </div>
    );
  }

  return (
    <div className="event-card">
      <div className="event-header">
        <div className="event-title-row">
          <h3>{title}</h3>
          {renderStatusBadge()}
        </div>
        <span className="event-time">
          {formatEventTime(startTime, endTime)}
        </span>
      </div>
      {clubName && (
        <p className="club-name" style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>
          {clubName}
        </p>
      )}
      <p className="event-description">{description}</p>
      <div className="event-footer">
        <span className="location">📍 {locationAddress}</span>
        
        <div className="event-attendees">
          {renderAttendeeBubbles()}
          {attendeeCount > 0 && (
            <span className="attendee-count">{attendeeCount} going</span>
          )}
          {renderAttendanceButton()}
        </div>
      </div>
    </div>
  );
}
