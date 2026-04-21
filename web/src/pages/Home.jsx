import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import EventCard from '../components/EventCard';
import MapView from '../components/MapView';
import { filterRelevantEvents, sortEventsByStatus } from '../lib/eventUtils';

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

      const now = new Date();
      const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);

      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .lte('start_time', fourHoursFromNow.toISOString())
        .gte('end_time', now.toISOString());

      if (fetchError) throw fetchError;

      const relevantEvents = filterRelevantEvents(data || []);
      const sortedEvents = sortEventsByStatus(relevantEvents);

      setEvents(sortedEvents);
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
        <h2>Live & Starting Soon</h2>
        {loading ? (
          <div className="loading-container">
            <p>Loading events...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <p>No live or upcoming events right now</p>
            <p>Check back soon or create your own event!</p>
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
                clubName={event.club_name}
                imageUrl={event.image_url}
                variant="compact"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
