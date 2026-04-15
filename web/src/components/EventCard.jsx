import { useAuth } from '../contexts/AuthContext';
import { useEventAttendance } from '../hooks/useEventAttendance';

export default function EventCard({ event, variant = 'feed' }) {
  const { user } = useAuth();
  const { attendees, isGoing, toggleAttendance, attendeeCount } = useEventAttendance(
    event.id,
    user?.id
  );

  const formatEventTime = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (variant === 'pin') {
      const startTimeStr = start.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
      
      const endTimeStr = end.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
      
      return `${startTimeStr} - ${endTimeStr}`;
    } else {
      const dateStr = start.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      const startTimeStr = start.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
      
      const endTimeStr = end.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
      
      return `${dateStr} • ${startTimeStr} - ${endTimeStr}`;
    }
  };

  const truncateDescription = (text, maxLength = 80) => {
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

  if (variant === 'pin') {
    return (
      <div className="event-pin">
        <h3>{event.title}</h3>
        <p className="location">📍 {event.location_address}</p>
        <p className="description">{truncateDescription(event.description)}</p>
        <p className="time">
          {formatEventTime(event.start_time, event.end_time)}
        </p>
        
        <div className="event-attendees">
          <div className="attendee-bubbles">
            {visibleAttendees.map((attendee) => (
              <div key={attendee.id} className="attendee-bubble" title={attendee.profiles?.full_name || 'User'}>
                {attendee.profiles?.avatar_url ? (
                  <img src={attendee.profiles.avatar_url} alt={attendee.profiles.full_name} />
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
          
          <button 
            className={`attendance-btn ${isGoing ? 'going' : ''}`}
            onClick={toggleAttendance}
            disabled={!user}
          >
            {isGoing ? 'Going' : "I'm Going"}
          </button>
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
        <h3>{event.title}</h3>
        <span className="event-time">
          {formatEventTime(event.start_time, event.end_time)}
        </span>
      </div>
      <p className="event-description">{event.description}</p>
      <div className="event-footer">
        <span className="location">📍 {event.location_address}</span>
        
        <div className="event-attendees">
          <div className="attendee-bubbles">
            {visibleAttendees.map((attendee) => (
              <div key={attendee.id} className="attendee-bubble" title={attendee.profiles?.full_name || 'User'}>
                {attendee.profiles?.avatar_url ? (
                  <img src={attendee.profiles.avatar_url} alt={attendee.profiles.full_name} />
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
          
          {attendeeCount > 0 && (
            <span className="attendee-count">{attendeeCount} going</span>
          )}
          
          <button 
            className={`attendance-btn ${isGoing ? 'going' : ''}`}
            onClick={toggleAttendance}
            disabled={!user}
          >
            {isGoing ? 'Going' : "I'm Going"}
          </button>
        </div>
      </div>
    </div>
  );
}
