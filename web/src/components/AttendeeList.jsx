import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function AttendeeModal({ attendees, isOpen, onClose, currentUserId }) {
  if (!isOpen) return null;

  const sortedAttendees = [...attendees].sort((a, b) => {
    if (a.user_id === currentUserId) return -1;
    if (b.user_id === currentUserId) return 1;
    return 0;
  });

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getAvatarColor = (userId) => {
    const colors = [
      'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
      'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    ];
    const hash = userId?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return colors[hash % colors.length];
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container attendee-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content attendee-modal-content">
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="attendee-modal-header">
            <h3>Who's Going</h3>
            <span className="attendee-modal-count">{attendees.length} {attendees.length === 1 ? 'person' : 'people'}</span>
          </div>

          <div className="attendee-modal-list">
            {sortedAttendees.length === 0 ? (
              <div className="attendee-modal-empty">
                <div className="empty-icon">👥</div>
                <p>No one is going yet</p>
                <p className="empty-subtext">Be the first to join!</p>
              </div>
            ) : (
              sortedAttendees.map((attendee, index) => {
                const isCurrentUser = attendee.user_id === currentUserId;
                return (
                  <div 
                    key={attendee.id} 
                    className={`attendee-modal-item ${isCurrentUser ? 'current-user' : ''}`}
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <div className="attendee-modal-avatar" style={{ background: getAvatarColor(attendee.user_id) }}>
                      {attendee.profiles?.avatar_url ? (
                        <img src={attendee.profiles.avatar_url} alt={attendee.profiles?.full_name || 'User'} />
                      ) : (
                        <span>{getInitials(attendee.profiles?.full_name)}</span>
                      )}
                    </div>
                    <div className="attendee-modal-info">
                      <span className="attendee-modal-name">
                        {attendee.profiles?.full_name || 'Anonymous User'}
                        {isCurrentUser && <span className="you-badge">You</span>}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AttendeeList({ attendees, currentUserId, variant = 'default', onClick }) {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getAvatarColor = (userId) => {
    const colors = [
      'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
      'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    ];
    const hash = userId?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return colors[hash % colors.length];
  };

  const sortedAttendees = [...attendees].sort((a, b) => {
    if (a.user_id === currentUserId) return -1;
    if (b.user_id === currentUserId) return 1;
    return 0;
  });

  const visibleAttendees = sortedAttendees.slice(0, 5);
  const remainingCount = Math.max(0, attendees.length - 5);

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else {
      setShowModal(true);
    }
  };

  if (attendees.length === 0) {
    return (
      <div className={`attendee-list-empty ${variant}`}>
        <span className="attendee-empty-text">Be the first to go</span>
      </div>
    );
  }

  return (
    <>
      <div 
        className={`attendee-list-container ${variant}`}
        onClick={handleClick}
      >
        <div className="attendee-bubbles-row">
          {visibleAttendees.map((attendee, index) => (
            <div 
              key={attendee.id} 
              className="attendee-bubble-enhanced" 
              title={attendee.profiles?.full_name || 'User'}
              style={{ 
                zIndex: visibleAttendees.length - index,
                animationDelay: `${index * 0.05}s`
              }}
            >
              <div className="attendee-bubble-inner" style={{ background: getAvatarColor(attendee.user_id) }}>
                {attendee.profiles?.avatar_url ? (
                  <img 
                    src={attendee.profiles.avatar_url} 
                    alt={attendee.profiles?.full_name || 'User'} 
                  />
                ) : (
                  <span>{getInitials(attendee.profiles?.full_name)}</span>
                )}
              </div>
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="attendee-bubble-enhanced more-bubble">
              <div className="attendee-bubble-inner more-count">
                <span>+{remainingCount}</span>
              </div>
            </div>
          )}
        </div>
        <span className="attendee-count-text">
          {attendees.length} {attendees.length === 1 ? 'going' : 'going'}
        </span>
      </div>

      <AttendeeModal 
        attendees={attendees}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentUserId={currentUserId || user?.id}
      />
    </>
  );
}
