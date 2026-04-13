import { mockEvents } from '../lib/mockData';

export default function Feed() {
  return (
    <div className="page">
      <h1>Event Feed</h1>
      <div className="feed-container">
        {mockEvents.map(event => (
          <div key={event.id} className="event-card">
            <div className="event-header">
              <h3>{event.title}</h3>
              <span className="event-time">
                {new Date(event.startTime).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })} at {new Date(event.startTime).toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <p className="event-description">{event.description}</p>
            <div className="event-footer">
              <span className="location">📍 {event.location}</span>
              <span className="attendees">{event.attendees} people going</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
