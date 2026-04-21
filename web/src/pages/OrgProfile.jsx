import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import VerifiedBadge from '../components/VerifiedBadge';
import EventCard from '../components/EventCard';

export default function OrgProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [orgProfile, setOrgProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (username) {
      fetchOrgProfile();
    }
  }, [username]);

  const fetchOrgProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('org_username', username)
        .eq('account_type', 'organization')
        .single();

      if (profileError) throw profileError;

      if (!profileData) {
        setError('Organization not found');
        setLoading(false);
        return;
      }

      setOrgProfile(profileData);

      const now = new Date().toISOString();
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!creator_id (
            id,
            account_type,
            org_name,
            org_username,
            org_avatar_url,
            is_verified
          )
        `)
        .eq('creator_id', profileData.id)
        .gte('end_time', now)
        .order('start_time', { ascending: true });

      if (eventsError) throw eventsError;

      setEvents(eventsData || []);
    } catch (err) {
      console.error('Error fetching org profile:', err);
      setError('Failed to load organization profile');
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

  const upcomingEvents = events.filter(e => new Date(e.start_time) > new Date());
  const liveEvents = events.filter(e => {
    const now = new Date();
    return new Date(e.start_time) <= now && new Date(e.end_time) > now;
  });

  const eventsToShow = activeTab === 'upcoming' ? upcomingEvents : liveEvents;

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <p>Loading organization...</p>
        </div>
      </div>
    );
  }

  if (error || !orgProfile) {
    return (
      <div className="page">
        <div className="error-container">
          <h2>Organization Not Found</h2>
          <p>{error || 'The organization you are looking for does not exist.'}</p>
          <button className="btn-primary" onClick={() => navigate('/feed')}>
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page org-profile-page">
      <div className="org-profile-header">
        <div className="org-profile-avatar-container">
          {orgProfile.org_avatar_url ? (
            <img 
              src={orgProfile.org_avatar_url} 
              alt={orgProfile.org_name}
              className="org-profile-avatar"
            />
          ) : (
            <div className="org-profile-avatar-placeholder">
              {orgProfile.org_name?.charAt(0)?.toUpperCase() || 'O'}
            </div>
          )}
        </div>

        <div className="org-profile-info">
          <div className="org-profile-name-row">
            <h1>{orgProfile.org_name}</h1>
            {orgProfile.is_verified && <VerifiedBadge size="large" />}
          </div>
          
          {orgProfile.org_username && (
            <p className="org-profile-username">@{orgProfile.org_username}</p>
          )}

          {orgProfile.org_category && (
            <span className="org-profile-category">{orgProfile.org_category}</span>
          )}

          {orgProfile.org_bio && (
            <p className="org-profile-bio">{orgProfile.org_bio}</p>
          )}

          {orgProfile.org_contact_link && (
            <a 
              href={orgProfile.org_contact_link}
              target="_blank"
              rel="noopener noreferrer"
              className="org-profile-contact-link"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              Contact / Learn More
            </a>
          )}
        </div>
      </div>

      <div className="org-profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Events ({upcomingEvents.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveTab('live')}
        >
          Live Now ({liveEvents.length})
        </button>
      </div>

      <div className="org-profile-events">
        {eventsToShow.length === 0 ? (
          <div className="empty-state">
            <p>
              {activeTab === 'upcoming' 
                ? 'No upcoming events scheduled'
                : 'No live events right now'}
            </p>
          </div>
        ) : (
          <div className="events-grid">
            {eventsToShow.map(event => (
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
                creatorProfile={event.creator}
                variant="feed"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
