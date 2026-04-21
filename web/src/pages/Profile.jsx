import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myEvents, setMyEvents] = useState([]);
  const [attendingEvents, setAttendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('created');
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      const [createdEventsResult, attendingEventsResult] = await Promise.all([
        supabase
          .from('events')
          .select('*')
          .eq('creator_id', user.id)
          .order('start_time', { ascending: false }),
        
        supabase
          .from('event_attendees')
          .select(`
            event_id,
            events (
              id,
              title,
              description,
              location_address,
              start_time,
              end_time,
              image_url,
              club_name
            )
          `)
          .eq('user_id', user.id)
      ]);

      if (createdEventsResult.error) throw createdEventsResult.error;
      if (attendingEventsResult.error) throw attendingEventsResult.error;

      setMyEvents(createdEventsResult.data || []);
      
      const attending = attendingEventsResult.data
        ?.map(item => item.events)
        .filter(event => event !== null)
        .sort((a, b) => new Date(b.start_time) - new Date(a.start_time)) || [];
      
      setAttendingEvents(attending);
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatEventTime = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const dateStr = start.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: start.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
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

  const getInitials = (email) => {
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase();
  };

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    try {
      setDeletingEventId(eventToDelete.id);
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventToDelete.id);

      if (error) throw error;

      setMyEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
      setShowDeleteConfirm(false);
      setEventToDelete(null);
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Failed to delete event. Please try again.');
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleEditClick = (eventId) => {
    navigate(`/edit/${eventId}`);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const eventsToShow = activeTab === 'created' ? myEvents : attendingEvents;

  return (
    <div className="page">
      <div className="profile-container">
        <div className="user-info">
          <div className="avatar">
            {getInitials(user.email)}
          </div>
          <div className="user-details">
            <h2>{user.email.split('@')[0]}</h2>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'created' ? 'active' : ''}`}
            onClick={() => setActiveTab('created')}
          >
            My Events ({myEvents.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'attending' ? 'active' : ''}`}
            onClick={() => setActiveTab('attending')}
          >
            Attending ({attendingEvents.length})
          </button>
        </div>

        <div className="user-events">
          {eventsToShow.length === 0 ? (
            <div className="empty-state">
              <p>
                {activeTab === 'created' 
                  ? "You haven't created any events yet"
                  : "You're not attending any events yet"}
              </p>
              <p>
                {activeTab === 'created' 
                  ? "Create your first event to get started!"
                  : "Browse the feed to find events to attend"}
              </p>
            </div>
          ) : (
            <div className="events-list">
              {eventsToShow.map(event => (
                <div key={event.id} className="profile-event-card">
                  {event.image_url && (
                    <div className="event-image">
                      <img src={event.image_url} alt={event.title} />
                    </div>
                  )}
                  <div className="event-content">
                    <div className="event-header-row">
                      <h4>{event.title}</h4>
                      {activeTab === 'created' && (
                        <div className="event-actions">
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEditClick(event.id)}
                            title="Edit event"
                          >
                            ✏️
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteClick(event)}
                            disabled={deletingEventId === event.id}
                            title="Delete event"
                          >
                            {deletingEventId === event.id ? '⏳' : '🗑️'}
                          </button>
                        </div>
                      )}
                    </div>
                    {event.club_name && (
                      <p className="club-name">{event.club_name}</p>
                    )}
                    <p className="location">📍 {event.location_address}</p>
                    <p className="time">
                      🕐 {formatEventTime(event.start_time, event.end_time)}
                    </p>
                    {event.description && (
                      <p className="description">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="delete-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon">⚠️</div>
            <h3>Delete Event?</h3>
            <p>Are you sure you want to delete "{eventToDelete?.title}"? This action cannot be undone.</p>
            <div className="delete-actions">
              <button
                className="delete-confirm-btn"
                onClick={handleDeleteConfirm}
                disabled={deletingEventId}
              >
                {deletingEventId ? 'Deleting...' : 'Delete Event'}
              </button>
              <button
                className="delete-cancel-btn"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setEventToDelete(null);
                }}
                disabled={deletingEventId}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
