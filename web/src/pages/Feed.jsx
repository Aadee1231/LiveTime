import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Feed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');

      const now = new Date().toISOString();

      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .gte('end_time', now)
        .order('start_time', { ascending: true });

      if (fetchError) throw fetchError;

      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatEventTime = (startTime, endTime) => {
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

  if (loading) {
    return (
      <div className="page">
        <h1>Event Feed</h1>
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h1>Event Feed</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Event Feed</h1>
      {events.length === 0 ? (
        <div className="empty-state">
          <p>No upcoming events yet.</p>
          <p>Be the first to create one!</p>
        </div>
      ) : (
        <div className="feed-container">
          {events.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <h3>{event.title}</h3>
                <span className="event-time">
                  {formatEventTime(event.start_time, event.end_time)}
                </span>
              </div>
              <p className="event-description">{event.description}</p>
              <div className="event-footer">
                <span className="location">📍 {event.location_address}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
