import { useMemo } from 'react';
import StatusBadge from './StatusBadge';
import { getEventStatus } from '../lib/eventUtils';

export default function EventPreviewCard({ formData }) {
  const { title, description, location_address, start_time, end_time, club_name, category, free_food } = formData;

  const eventStatus = useMemo(() => {
    if (!start_time || !end_time) return null;
    return getEventStatus(start_time, end_time);
  }, [start_time, end_time]);

  const formatPreviewTime = (startTime, endTime) => {
    if (!startTime || !endTime) return 'Select date & time';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
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
  };

  const categoryIcons = {
    social: '🎉',
    academic: '📚',
    sports: '⚽',
    food: '🍕',
    club: '👥',
    outdoors: '🌲'
  };

  const hasContent = title || description || location_address || start_time;

  return (
    <div className="event-preview-card">
      <div className="preview-header">
        <h4>Live Preview</h4>
        <span className="preview-subtitle">How your event will appear</span>
      </div>

      <div className={`preview-event-card ${!hasContent ? 'empty' : ''}`}>
        {!hasContent ? (
          <div className="preview-empty">
            <span className="preview-empty-icon">✨</span>
            <p>Start filling out the form to see a preview</p>
          </div>
        ) : (
          <>
            <div className="preview-event-header">
              <div className="preview-title-row">
                <h3>{title || 'Event Title'}</h3>
                {eventStatus && <StatusBadge status={eventStatus} />}
              </div>
              <span className="preview-time">
                {formatPreviewTime(start_time, end_time)}
              </span>
            </div>

            {club_name && (
              <p className="preview-club-name">{club_name}</p>
            )}

            {description && (
              <p className="preview-description">
                {description.length > 120 ? description.substring(0, 120) + '...' : description}
              </p>
            )}

            <div className="preview-footer">
              <div className="preview-meta">
                {location_address && (
                  <span className="preview-location">📍 {location_address}</span>
                )}
                {category && (
                  <span className="preview-category">
                    {categoryIcons[category] || '🎯'} {category}
                  </span>
                )}
                {free_food && (
                  <span className="preview-badge free-food">🍕 Free Food</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
