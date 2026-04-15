import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
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
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  const formatEventTime = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const startTimeStr = start.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    const endTimeStr = end.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    return `${startTimeStr} - ${endTimeStr}`;
  };

  const truncateDescription = (text, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="home-page">
      <div className="map-container">
        <div className="map-placeholder">
          <p>🗺️ Map View</p>
        </div>
      </div>
      
      <div className="event-pins">
        <h2>Nearby Events</h2>
        {loading ? (
          <p>Loading events...</p>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <p>No upcoming events yet.</p>
          </div>
        ) : (
          <div className="pins-grid">
            {events.map(event => (
              <div key={event.id} className="event-pin">
                <h3>{event.title}</h3>
                <p className="location">📍 {event.location_address}</p>
                <p className="description">{truncateDescription(event.description)}</p>
                <p className="time">
                  {formatEventTime(event.start_time, event.end_time)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
