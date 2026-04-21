export function getEventStatus(startTime, endTime) {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (now >= start && now <= end) {
    return 'live';
  }
  
  const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  if (start > now && start <= fourHoursFromNow) {
    return 'soon';
  }
  
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  
  if (start > fourHoursFromNow && start <= endOfToday) {
    return 'later_today';
  }
  
  return 'upcoming';
}

export function filterRelevantEvents(events) {
  const now = new Date();
  
  return events.filter(event => {
    const status = getEventStatus(event.start_time, event.end_time);
    return status === 'live' || status === 'soon';
  });
}

export function sortEventsByStatus(events) {
  return events.sort((a, b) => {
    const statusA = getEventStatus(a.start_time, a.end_time);
    const statusB = getEventStatus(b.start_time, b.end_time);
    
    const statusOrder = { live: 0, soon: 1, later_today: 2, upcoming: 3 };
    
    if (statusOrder[statusA] !== statusOrder[statusB]) {
      return statusOrder[statusA] - statusOrder[statusB];
    }
    
    return new Date(a.start_time) - new Date(b.start_time);
  });
}

export function filterEventsByTab(events, tab) {
  if (tab === 'all') return events;
  
  return events.filter(event => {
    const status = getEventStatus(event.start_time, event.end_time);
    
    if (tab === 'live') return status === 'live';
    if (tab === 'soon') return status === 'soon';
    if (tab === 'later') return status === 'later_today';
    
    return true;
  });
}

export function searchEvents(events, searchQuery) {
  if (!searchQuery || searchQuery.trim() === '') return events;
  
  const query = searchQuery.toLowerCase().trim();
  
  return events.filter(event => {
    const title = (event.title || '').toLowerCase();
    const description = (event.description || '').toLowerCase();
    const clubName = (event.club_name || '').toLowerCase();
    const location = (event.location_address || '').toLowerCase();
    
    return (
      title.includes(query) ||
      description.includes(query) ||
      clubName.includes(query) ||
      location.includes(query)
    );
  });
}

export function filterEventsByCategory(events, category) {
  if (!category || category === 'all') return events;
  
  return events.filter(event => {
    const title = (event.title || '').toLowerCase();
    const description = (event.description || '').toLowerCase();
    const clubName = (event.club_name || '').toLowerCase();
    
    const text = `${title} ${description} ${clubName}`;
    
    switch (category) {
      case 'social':
        return text.includes('social') || text.includes('party') || text.includes('mixer') || text.includes('hangout');
      case 'academic':
        return text.includes('academic') || text.includes('study') || text.includes('lecture') || text.includes('workshop') || text.includes('seminar');
      case 'sports':
        return text.includes('sport') || text.includes('game') || text.includes('match') || text.includes('tournament') || text.includes('fitness');
      case 'food':
        return text.includes('food') || text.includes('pizza') || text.includes('lunch') || text.includes('dinner') || text.includes('breakfast') || text.includes('snack');
      case 'club':
        return text.includes('club') || text.includes('meeting') || text.includes('organization');
      case 'outdoors':
        return text.includes('outdoor') || text.includes('hike') || text.includes('park') || text.includes('nature') || text.includes('camping');
      default:
        return true;
    }
  });
}

export function getAllEventsForFeed(events) {
  return events.filter(event => {
    const status = getEventStatus(event.start_time, event.end_time);
    return status === 'live' || status === 'soon' || status === 'later_today';
  });
}
