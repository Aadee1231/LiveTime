import LivePulseDot from './LivePulseDot';

export default function StatusBadge({ status, showIcon = true }) {
  if (!status || status === 'later') return null;

  const config = {
    live: {
      label: 'Live Now',
      color: 'live',
      className: 'status-badge-live',
      icon: showIcon
    },
    soon: {
      label: 'Starting Soon',
      color: 'soon',
      className: 'status-badge-soon',
      icon: showIcon
    }
  };

  const badge = config[status];
  if (!badge) return null;

  return (
    <span className={`status-badge ${badge.className}`}>
      {badge.icon && <LivePulseDot size="sm" color={badge.color} />}
      <span className="status-badge-label">{badge.label}</span>
    </span>
  );
}
