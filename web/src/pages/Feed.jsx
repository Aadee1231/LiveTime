import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import EventCard from '../components/EventCard';
import { 
  getAllEventsForFeed, 
  sortEventsByStatus, 
  filterEventsByTab,
  searchEvents,
  filterEventsByCategory
} from '../lib/eventUtils';

const TABS = [
  { id: 'all', label: 'All Events', icon: '🎯' },
  { id: 'live', label: 'Live Now', icon: '🔴' },
  { id: 'soon', label: 'Starting Soon', icon: '⏰' },
  { id: 'later', label: 'Later Today', icon: '📅' }
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🎯' },
  { id: 'social', label: 'Social', icon: '🎉' },
  { id: 'academic', label: 'Academic', icon: '📚' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'food', label: 'Free Food', icon: '🍕' },
  { id: 'club', label: 'Club', icon: '👥' },
  { id: 'outdoors', label: 'Outdoors', icon: '🌲' }
];

export default function Feed() {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');

      const now = new Date();
      const endOfToday = new Date(now);
      endOfToday.setHours(23, 59, 59, 999);

      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .lte('start_time', endOfToday.toISOString())
        .gte('end_time', now.toISOString());

      if (fetchError) throw fetchError;

      const relevantEvents = getAllEventsForFeed(data || []);
      const sortedEvents = sortEventsByStatus(relevantEvents);

      setAllEvents(sortedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    let result = allEvents;
    
    result = filterEventsByTab(result, activeTab);
    result = searchEvents(result, searchQuery);
    result = filterEventsByCategory(result, selectedCategory);
    
    return result;
  }, [allEvents, activeTab, searchQuery, selectedCategory]);

  const hasActiveFilters = searchQuery || selectedCategory !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const renderSkeletons = () => (
    <div className="feed-results">
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text"></div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => {
    if (allEvents.length === 0) {
      return (
        <div className="feed-empty-state">
          <div className="empty-icon">🎪</div>
          <h3>No events happening today</h3>
          <p>Check back later or be the first to create an event!</p>
        </div>
      );
    }

    if (activeTab !== 'all' && filteredEvents.length === 0) {
      const tabLabel = TABS.find(t => t.id === activeTab)?.label || 'this category';
      return (
        <div className="feed-empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Nothing in {tabLabel}</h3>
          <p>Try selecting a different tab to see more events.</p>
        </div>
      );
    }

    if (hasActiveFilters && filteredEvents.length === 0) {
      return (
        <div className="feed-empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No events match your filters</h3>
          <p>Try adjusting your search or category filters.</p>
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="page feed-page">
        <div className="feed-header">
          <div className="feed-header-content">
            <h1>Discover Events</h1>
            <p className="feed-subtitle">Find what's happening on campus today</p>
          </div>
        </div>
        {renderSkeletons()}
      </div>
    );
  }

  if (error) {
    return (
      <div className="page feed-page">
        <div className="feed-header">
          <div className="feed-header-content">
            <h1>Discover Events</h1>
            <p className="feed-subtitle">Find what's happening on campus today</p>
          </div>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="page feed-page">
      <div className="feed-header">
        <div className="feed-header-content">
          <h1>Discover Events</h1>
          <p className="feed-subtitle">Find what's happening on campus today</p>
        </div>
      </div>

      <div className="feed-controls">
        <div className="feed-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`feed-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="feed-filters">
          <div className="search-container">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search events, clubs, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>

          <div className="category-pills">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                className={`category-pill ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="pill-icon">{category.icon}</span>
                <span className="pill-label">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="feed-results">
          {filteredEvents.map((event, index) => (
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
              variant="feed"
            />
          ))}
        </div>
      ) : (
        renderEmptyState()
      )}
    </div>
  );
}
