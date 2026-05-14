import { useMemo } from 'react';
import LivePulseDot from './LivePulseDot';

export default function CampusPulseCard({ events }) {
  const stats = useMemo(() => {
    const now = new Date();
    
    const liveCount = events.filter(e => {
      const start = new Date(e.start_time);
      const end = new Date(e.end_time);
      return now >= start && now <= end;
    }).length;

    const soonCount = events.filter(e => {
      const start = new Date(e.start_time);
      const minutesUntilStart = (start - now) / (1000 * 60);
      return minutesUntilStart > 0 && minutesUntilStart <= 60;
    }).length;

    const laterCount = events.length - liveCount - soonCount;

    const categories = events.reduce((acc, event) => {
      const cat = event.category || 'other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

    return { liveCount, soonCount, laterCount, topCategory };
  }, [events]);

  if (events.length === 0) return null;

  return (
    <div className="campus-pulse-card">
      <div className="pulse-header">
        <div className="pulse-title-row">
          <LivePulseDot size="md" color="primary" />
          <h3>Campus Pulse</h3>
        </div>
        <span className="pulse-subtitle">Right now on campus</span>
      </div>

      <div className="pulse-stats">
        {stats.liveCount > 0 && (
          <div className="pulse-stat live">
            <div className="stat-icon">
              <LivePulseDot size="sm" color="live" />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.liveCount}</span>
              <span className="stat-label">Live Now</span>
            </div>
          </div>
        )}

        {stats.soonCount > 0 && (
          <div className="pulse-stat soon">
            <div className="stat-icon">
              <LivePulseDot size="sm" color="soon" />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.soonCount}</span>
              <span className="stat-label">Starting Soon</span>
            </div>
          </div>
        )}

        {stats.laterCount > 0 && (
          <div className="pulse-stat later">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <span className="stat-number">{stats.laterCount}</span>
              <span className="stat-label">Later Today</span>
            </div>
          </div>
        )}
      </div>

      {stats.topCategory && (
        <div className="pulse-trending">
          <span className="trending-label">Trending:</span>
          <span className="trending-category">{stats.topCategory[0]}</span>
        </div>
      )}
    </div>
  );
}
