# Event Filtering Updates - LiveTime MVP v1

## Summary of Changes

### ✅ Event Status Logic

**Status Definitions**
- **"Live Now"**: Current time is between `start_time` and `end_time`
- **"Starting Soon"**: `start_time` is within the next 4 hours
- **"Upcoming"**: Events beyond 4 hours (filtered out)

**Filtering Rules**
- Home and Feed pages show ONLY "Live Now" and "Starting Soon" events
- Database query optimized to fetch only relevant events
- Client-side filtering ensures accuracy

**Sorting Logic**
1. "Live Now" events first
2. "Starting Soon" events second
3. Within each group, sorted by start time (earliest first)

### ✅ Visual Indicators

**Status Badges**
- 🔴 **Live Now**: Red badge with red background
- ⏰ **Starting Soon**: Orange/yellow badge with amber background
- Badges appear on both compact (Home) and feed variants
- Small, unobtrusive design with emojis

**Badge Styling**
- Rounded corners (12px border-radius)
- Semi-transparent backgrounds
- Colored borders matching the status
- Font size: 0.75rem, weight: 600
- Flex-shrink: 0 to prevent wrapping

### ✅ Updated Components

**Files Modified**

1. **`web/src/lib/eventUtils.js`** (new)
   - `getEventStatus(startTime, endTime)`: Returns 'live', 'soon', or 'upcoming'
   - `filterRelevantEvents(events)`: Filters to only live and soon events
   - `sortEventsByStatus(events)`: Sorts by status priority, then by time

2. **`web/src/pages/Feed.jsx`**
   - Query optimized: `lte('start_time', 4 hours)` + `gte('end_time', now)`
   - Applies filtering and sorting
   - Updated empty state message
   - Title remains "Event Feed"

3. **`web/src/pages/Home.jsx`**
   - Same query optimization as Feed
   - Applies filtering and sorting
   - Updated section title to "Live & Starting Soon"
   - Updated empty state message

4. **`web/src/components/EventCard.jsx`**
   - Imports `getEventStatus` utility
   - Calculates event status on render
   - `renderStatusBadge()`: Renders appropriate badge
   - Added badges to both compact and feed variants
   - Updated layouts to accommodate badges

5. **`web/src/App.css`**
   - `.event-status-badge`: Base badge styling
   - `.event-status-badge.live`: Red styling for live events
   - `.event-status-badge.soon`: Amber styling for starting soon
   - `.event-pin-header`: Flex layout for compact cards
   - `.event-title-row`: Flex layout for feed cards

### ✅ Database Queries

**Optimized Query**
```javascript
const now = new Date();
const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);

supabase
  .from('events')
  .select('*')
  .lte('start_time', fourHoursFromNow.toISOString())
  .gte('end_time', now.toISOString())
```

**Benefits**
- Reduces data transfer (only fetches relevant events)
- Faster queries with indexed timestamp columns
- Client-side filtering adds extra safety

### ✅ User Experience

**Home Page**
- Map shows only live and starting soon events
- "Live & Starting Soon" section below map
- Compact cards with status badges
- Empty state: "No live or starting soon events right now."

**Feed Page**
- Full event cards with status badges
- Sorted with live events at top
- Empty state: "No live or starting soon events right now. Check back later or create an event!"

**Status Visibility**
- Badges clearly visible but not overwhelming
- Color-coded for quick recognition
- Emojis add visual interest
- Consistent across all card types

## Technical Details

### Event Status Calculation
```javascript
// Live: now >= start && now <= end
// Soon: start > now && start <= (now + 4 hours)
// Upcoming: start > (now + 4 hours)
```

### Sorting Priority
```javascript
const statusOrder = { live: 0, soon: 1, upcoming: 2 };
// Then by start_time ascending
```

### Badge Colors
- **Live**: Red (#dc2626) with rgba(239, 68, 68, 0.15) background
- **Soon**: Amber (#d97706) with rgba(251, 191, 36, 0.15) background

## Benefits

1. **Relevance**: Users only see events happening now or very soon
2. **Clarity**: Status badges make it obvious what's live vs starting soon
3. **Performance**: Optimized queries reduce load
4. **Simplicity**: Clean, minimal implementation
5. **Consistency**: Same logic across Home and Feed

## Future Enhancements (Optional)

- Add "Ended" status for recently finished events
- Allow users to toggle "Show all upcoming events"
- Add countdown timer for "Starting Soon" events
- Push notifications when followed events go live
- Filter by distance/location
