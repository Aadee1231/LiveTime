import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import EventCard from '../components/EventCard';
import { filterRelevantEvents, sortEventsByStatus } from '../lib/eventUtils';

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
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <p>No live or starting soon events right now.</p>
          <p>Check back later or create an event!</p>
        </div>
      ) : (
        <div className="feed-container">
          {events.map(event => (
            <EventCard 
              key={event.id}
              eventId={event.id}
              title={event.title}
              description={event.description}
              locationAddress={event.location_address}
              startTime={event.start_time}
              endTime={event.end_time}
              variant="feed"
            />
          ))}
        </div>
      )}
    </div>
  );
}
