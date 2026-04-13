import { mockUser, mockEvents } from '../lib/mockData';

export default function Profile() {
  const userEvents = mockEvents.filter(event => 
    mockUser.eventsGoing.includes(event.id)
  );

  return (
    <div className="page">
      <h1>Profile</h1>
      <div className="profile-container">
        <div className="user-info">
          <div className="avatar">
            {mockUser.name.charAt(0)}
          </div>
          <div className="user-details">
            <h2>{mockUser.name}</h2>
            <p>{mockUser.email}</p>
          </div>
        </div>

        <div className="user-events">
          <h3>Events I'm Going To ({userEvents.length})</h3>
          <div className="events-list">
            {userEvents.map(event => (
              <div key={event.id} className="profile-event-card">
                <h4>{event.title}</h4>
                <p className="location">📍 {event.location}</p>
                <p className="time">
                  {new Date(event.startTime).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })} at {new Date(event.startTime).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
