export default function VerifiedBadge({ size = 'default', className = '' }) {
  const sizeClasses = {
    small: 'verified-badge-small',
    default: 'verified-badge-default',
    large: 'verified-badge-large'
  };

  return (
    <span 
      className={`verified-badge ${sizeClasses[size]} ${className}`}
      title="Verified Organization"
      aria-label="Verified Organization"
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="currentColor"
        className="verified-badge-icon"
      >
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    </span>
  );
}
