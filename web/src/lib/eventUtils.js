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
    
    const statusOrder = { live: 0, soon: 1, upcoming: 2 };
    
    if (statusOrder[statusA] !== statusOrder[statusB]) {
      return statusOrder[statusA] - statusOrder[statusB];
    }
    
    return new Date(a.start_time) - new Date(b.start_time);
  });
}
