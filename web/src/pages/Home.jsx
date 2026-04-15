import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import EventCard from '../components/EventCard';
import MapView from '../components/MapView';

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

  return (
    <div className="home-page">
      <div className="map-container">
        {loading ? (
          <div className="map-placeholder">
            <p>Loading map...</p>
          </div>
        ) : (
          <MapView events={events} />
        )}
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
              <EventCard 
                key={event.id}
                eventId={event.id}
                title={event.title}
                description={event.description}
                locationAddress={event.location_address}
                startTime={event.start_time}
                endTime={event.end_time}
                variant="compact"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
