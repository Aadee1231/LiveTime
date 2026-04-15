import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import EventCard from '../components/EventCard';

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
            <EventCard key={event.id} event={event} variant="feed" />
          ))}
        </div>
      )}
    </div>
  );
}
