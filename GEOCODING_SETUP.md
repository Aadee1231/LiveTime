# Geocoding Setup - Complete! ✅

## What Was Implemented

### 1. **Geocoding Utility** (`/web/src/lib/geocoding.js`)
- Uses free OpenStreetMap Nominatim API (no API key needed)
- Biases results toward Raleigh, NC
- Returns lat/lng coordinates or graceful failure

### 2. **Updated Create Event Flow** (`/web/src/pages/Create.jsx`)
- Automatically geocodes address when form is submitted
- Shows user feedback: "Finding location on map..."
- Saves `location_lat` and `location_lng` to database
- **Fallback**: If geocoding fails, event is still created (just without map pin)

### 3. **Live Map** (`/web/src/components/MapView.jsx`)
- Shows events that are live now OR starting within 1 hour
- Only plots pins for events with coordinates
- Click pin to see event details

---

## What You Need to Do (ONE TIME SETUP)

### Step 1: Add Database Columns

Go to Supabase SQL Editor and run:

```sql
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_events_location ON public.events(location_lat, location_lng);
```

**Or** just copy/paste from: `/web/add_location_columns.sql`

---

## How It Works Now

### Creating an Event:
1. User fills out form with address like "Talley Student Union, NC State"
2. Clicks "Create Event"
3. System geocodes address → gets lat/lng
4. Saves event with coordinates to database
5. Event appears on map if it's live/starting soon!

### Fallback Behavior:
- If geocoding fails (bad address, API down, etc.):
  - User sees: "⚠️ Could not find exact location - event will be created without map pin"
  - Event is still created successfully
  - Just won't appear on map (but will show in feed)

---

## Testing

### Test Address Examples:
- "Talley Student Union, Raleigh, NC"
- "Hunt Library, NC State"
- "2806 Brigadoon Dr, Raleigh, NC"
- "Hillsborough Street, Raleigh"

### What to Expect:
1. Create event with one of these addresses
2. Set start time to NOW or within next hour
3. Go to Home page
4. See pin on map!
5. Click pin to see event details

---

## Rate Limits

OpenStreetMap Nominatim has a 1 request/second limit.

**For MVP**: This is fine (users won't create events that fast)

**For Production**: Consider upgrading to:
- Google Maps Geocoding API
- Mapbox Geocoding API
- Or cache common NC State locations

---

## Future Improvements (Not Needed Now)

- [ ] Add autocomplete for location field
- [ ] Cache common NC State locations
- [ ] Add "Use My Location" button
- [ ] Show geocoding preview before submitting
- [ ] Upgrade to paid geocoding API for better reliability

---

## That's It! 🎉

The live map feature is fully functional. Just run the SQL and start creating events!
