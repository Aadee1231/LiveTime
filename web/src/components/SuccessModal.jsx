import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SuccessModal({ show, onClose, eventId }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon-wrapper">
          <div className="success-icon">🎉</div>
        </div>
        <h2>Event Posted!</h2>
        <p>Your event is now live and visible to everyone</p>
        <div className="success-actions">
          <button
            className="success-btn primary"
            onClick={() => navigate('/feed')}
          >
            Go to Feed
          </button>
          <button
            className="success-btn secondary"
            onClick={() => navigate('/profile')}
          >
            View Profile
          </button>
          <button
            className="success-btn tertiary"
            onClick={onClose}
          >
            Create Another
          </button>
        </div>
      </div>
    </div>
  );
}
