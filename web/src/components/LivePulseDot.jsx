export default function LivePulseDot({ size = 'md', color = 'live' }) {
  const sizes = {
    sm: '8px',
    md: '12px',
    lg: '16px'
  };

  const colors = {
    live: 'var(--status-live)',
    soon: 'var(--status-soon)',
    primary: 'var(--primary)'
  };

  return (
    <span 
      className="live-pulse-dot"
      style={{
        '--dot-size': sizes[size],
        '--dot-color': colors[color]
      }}
    >
      <style>{`
        .live-pulse-dot {
          position: relative;
          display: inline-block;
          width: var(--dot-size);
          height: var(--dot-size);
        }

        .live-pulse-dot::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--dot-color);
          border-radius: 50%;
          animation: pulse-core 2s ease-in-out infinite;
        }

        .live-pulse-dot::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--dot-color);
          border-radius: 50%;
          opacity: 0.6;
          animation: pulse-ring 2s ease-in-out infinite;
        }

        @keyframes pulse-core {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(0.9);
            opacity: 0.8;
          }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </span>
  );
}
