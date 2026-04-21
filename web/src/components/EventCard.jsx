import { useAuth } from '../contexts/AuthContext';
import { useEventModal } from '../contexts/EventModalContext';
import { useEventAttendance } from '../hooks/useEventAttendance';
import { getEventStatus } from '../lib/eventUtils';
import AttendeeList from './AttendeeList';
import ImGoingButton from './ImGoingButton';

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
  const { openEventModal } = useEventModal();
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


  const handleCardClick = () => {
    openEventModal({
      id: eventId,
      title,
      description,
      location_address: locationAddress,
      start_time: startTime,
      end_time: endTime,
      club_name: clubName,
      image_url: imageUrl
    });
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

  const handleAttendanceToggle = async () => {
    await toggleAttendance();
  };

  if (variant === 'compact') {
    return (
      <div className="event-pin" onClick={handleCardClick}>
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
        
        <div className="event-attendees-section">
          <AttendeeList 
            attendees={attendees}
            currentUserId={user?.id}
            variant="compact"
          />
          <ImGoingButton 
            isGoing={isGoing}
            onToggle={handleAttendanceToggle}
            disabled={!user}
            loading={loading}
            variant="compact"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="event-card" onClick={handleCardClick}>
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
        
        <div className="event-attendees-section">
          <AttendeeList 
            attendees={attendees}
            currentUserId={user?.id}
            variant="default"
          />
          <ImGoingButton 
            isGoing={isGoing}
            onToggle={handleAttendanceToggle}
            disabled={!user}
            loading={loading}
            variant="default"
          />
        </div>
      </div>
    </div>
  );
}
