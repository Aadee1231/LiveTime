import { mockEvents } from '../lib/mockData';

export default function Home() {
  return (
    <div className="home-page">
      <div className="map-container">
        <div className="map-placeholder">
          <p>🗺️ Map View</p>
        </div>
      </div>
      
      <div className="event-pins">
        <h2>Nearby Events</h2>
        <div className="pins-grid">
          {mockEvents.map(event => (
            <div key={event.id} className="event-pin">
              <h3>{event.title}</h3>
              <p className="location">📍 {event.location}</p>
              <p className="time">
                {new Date(event.startTime).toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
              </p>
              <p className="attendees">{event.attendees} people going</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
