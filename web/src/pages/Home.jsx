import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import EventCard from '../components/EventCard';
import MapView from '../components/MapView';
import { filterRelevantEvents, sortEventsByStatus, getEventStatus, searchEvents } from '../lib/eventUtils';

const FILTER_TABS = [
  { id: 'all', label: 'All', icon: '🎯' },
  { id: 'live', label: 'Live Now', icon: '🔴' },
  { id: 'soon', label: 'Starting Soon', icon: '⏰' }
];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(null);

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

  const filteredEvents = useMemo(() => {
    let result = events;
    
    if (activeFilter !== 'all') {
      result = result.filter(event => {
        const status = getEventStatus(event.start_time, event.end_time);
        if (activeFilter === 'live') return status === 'live';
        if (activeFilter === 'soon') return status === 'soon';
        return true;
      });
    }
    
    if (searchQuery) {
      result = searchEvents(result, searchQuery);
    }
    
    return result;
  }, [events, activeFilter, searchQuery]);

  const handleEventCardClick = (eventId) => {
    setSelectedEventId(eventId);
    const event = events.find(e => e.id === eventId);
    if (event && event.location_lat && event.location_lng) {
      setMapCenter([event.location_lat, event.location_lng]);
      setMapZoom(16);
    }
  };

  const handleMarkerClick = (eventId) => {
    setSelectedEventId(eventId);
  };

  const handleRecenterMap = () => {
    setMapCenter([35.7847, -78.6821]);
    setMapZoom(14);
    setSelectedEventId(null);
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <div className="home-header-content">
          <h1>Live Events Near You</h1>
          <p className="home-subtitle">Discover what's happening on campus right now</p>
        </div>
      </div>

      <div className="map-section">
        <div className="map-controls-bar">
          <div className="map-filter-tabs">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.id}
                className={`map-filter-tab ${activeFilter === tab.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="map-actions">
            <div className="map-search-container">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                className="map-search-input"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
            <button className="recenter-btn" onClick={handleRecenterMap} title="Recenter to Campus">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>Campus</span>
            </button>
          </div>
        </div>

        <div className="map-container-premium">
          {loading ? (
            <div className="map-placeholder">
              <p>Loading map...</p>
            </div>
          ) : (
            <MapView 
              events={filteredEvents} 
              selectedEventId={selectedEventId}
              onMarkerClick={handleMarkerClick}
              mapCenter={mapCenter}
              mapZoom={mapZoom}
            />
          )}
        </div>
      </div>
      
      <div className="event-list-section">
        <div className="event-list-header">
          <h2>Events</h2>
          <span className="event-count">{filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}</span>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <p>Loading events...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state-premium">
            <div className="empty-icon">🎪</div>
            <h3>No events found</h3>
            <p>
              {activeFilter !== 'all' 
                ? `No ${FILTER_TABS.find(t => t.id === activeFilter)?.label.toLowerCase()} events right now`
                : searchQuery
                ? 'Try adjusting your search'
                : 'No live or upcoming events right now'}
            </p>
            {(activeFilter !== 'all' || searchQuery) && (
              <button 
                className="clear-filters-btn" 
                onClick={() => {
                  setActiveFilter('all');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="event-list-grid">
            {filteredEvents.map(event => (
              <div 
                key={event.id}
                className={`event-card-wrapper ${selectedEventId === event.id ? 'selected' : ''}`}
                onClick={() => handleEventCardClick(event.id)}
              >
                <EventCard 
                  eventId={event.id}
                  title={event.title}
                  description={event.description}
                  locationAddress={event.location_address}
                  startTime={event.start_time}
                  endTime={event.end_time}
                  clubName={event.club_name}
                  imageUrl={event.image_url}
                  creatorProfile={event.creator}
                  variant="compact"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
