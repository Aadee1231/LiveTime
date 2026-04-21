import { useState } from 'react';

export default function ImGoingButton({ 
  isGoing, 
  onToggle, 
  disabled = false, 
  variant = 'default',
  loading = false 
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation();
    if (disabled || loading) return;

    setIsAnimating(true);
    await onToggle();
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  return (
    <button 
      className={`im-going-btn ${isGoing ? 'going' : ''} ${variant} ${isAnimating ? 'animating' : ''}`}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      <span className="btn-content">
        {loading ? (
          <>
            <svg className="btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            <span>Loading...</span>
          </>
        ) : isGoing ? (
          <>
            <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Going</span>
          </>
        ) : (
          <>
            <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <span>I'm Going</span>
          </>
        )}
      </span>
      
      {isAnimating && (
        <span className="btn-ripple"></span>
      )}
    </button>
  );
}
