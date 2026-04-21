import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEventAttendance } from '../hooks/useEventAttendance';
import { getEventStatus } from '../lib/eventUtils';

export default function EventDetailModal({ event, onClose }) {
  const { user } = useAuth();
  const { attendees, isGoing, toggleAttendance, attendeeCount } = useEventAttendance(
    event?.id,
    user?.id
  );

  useEffect(() => {
    if (!event) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [event, onClose]);

  if (!event) return null;

  const eventStatus = getEventStatus(event.start_time, event.end_time);

  const formatEventTime = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const dateStr = startDate.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
    
    const startTimeStr = startDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    const endTimeStr = endDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    return { dateStr, timeStr: `${startTimeStr} - ${endTimeStr}` };
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const visibleAttendees = attendees.slice(0, 8);
  const remainingCount = Math.max(0, attendeeCount - 8);

  const { dateStr, timeStr } = formatEventTime(event.start_time, event.end_time);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/event/${event.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: `${window.location.origin}/event/${event.id}`,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-content">
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="modal-header">
            <div className="modal-title-section">
              <h2 className="modal-title">{event.title}</h2>
              {event.club_name && (
                <p className="modal-club-name">{event.club_name}</p>
              )}
            </div>
            {(eventStatus === 'live' || eventStatus === 'soon') && (
              <div className="modal-status-badge-container">
                {eventStatus === 'live' && (
                  <span className="event-status-badge live">🔴 Live Now</span>
                )}
                {eventStatus === 'soon' && (
                  <span className="event-status-badge soon">⏰ Starting Soon</span>
                )}
              </div>
            )}
          </div>

          {event.image_url && (
            <div className="modal-image-container">
              <img src={event.image_url} alt={event.title} className="modal-image" />
            </div>
          )}

          {!event.image_url && (
            <div className="modal-image-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <p>No event image</p>
            </div>
          )}

          <div className="modal-details">
            <div className="modal-detail-item">
              <div className="modal-detail-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="modal-detail-content">
                <p className="modal-detail-label">Date & Time</p>
                <p className="modal-detail-value">{dateStr}</p>
                <p className="modal-detail-time">{timeStr}</p>
              </div>
            </div>

            <div className="modal-detail-item">
              <div className="modal-detail-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div className="modal-detail-content">
                <p className="modal-detail-label">Location</p>
                <p className="modal-detail-value">{event.location_address}</p>
              </div>
            </div>

            {event.description && (
              <div className="modal-detail-item modal-description-item">
                <div className="modal-detail-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div className="modal-detail-content">
                  <p className="modal-detail-label">Description</p>
                  <p className="modal-detail-description">{event.description}</p>
                </div>
              </div>
            )}
          </div>

          <div className="modal-attendees-section">
            <div className="modal-attendees-header">
              <h3 className="modal-attendees-title">
                {attendeeCount === 0 ? 'No one going yet' : attendeeCount === 1 ? '1 person going' : `${attendeeCount} people going`}
              </h3>
            </div>
            
            {attendeeCount > 0 && (
              <div className="modal-attendee-list">
                {visibleAttendees.map((attendee) => (
                  <div key={attendee.id} className="modal-attendee-item">
                    <div className="modal-attendee-avatar">
                      {attendee.profiles?.avatar_url ? (
                        <img 
                          src={attendee.profiles.avatar_url} 
                          alt={attendee.profiles.full_name || 'User'} 
                        />
                      ) : (
                        <span>{getInitials(attendee.profiles?.full_name)}</span>
                      )}
                    </div>
                    <span className="modal-attendee-name">
                      {attendee.profiles?.full_name || 'User'}
                    </span>
                  </div>
                ))}
                {remainingCount > 0 && (
                  <div className="modal-attendee-item modal-attendee-more">
                    <div className="modal-attendee-avatar">
                      <span>+{remainingCount}</span>
                    </div>
                    <span className="modal-attendee-name">
                      {remainingCount === 1 ? '1 more' : `${remainingCount} more`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {attendeeCount === 0 && (
              <div className="modal-attendees-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <p>Be the first to join this event!</p>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button 
              className={`modal-primary-btn ${isGoing ? 'going' : ''}`}
              onClick={toggleAttendance}
              disabled={!user}
            >
              {isGoing ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Going
                </>
              ) : (
                "I'm Going"
              )}
            </button>

            <div className="modal-secondary-actions">
              <button 
                className="modal-secondary-btn"
                onClick={handleCopyLink}
                title="Copy link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </button>

              <button 
                className="modal-secondary-btn"
                onClick={handleShare}
                title="Share"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
