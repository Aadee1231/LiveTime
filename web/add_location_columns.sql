-- Add location coordinates columns to events table
-- Run this in Supabase SQL Editor

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION;

-- Optional: Add an index for faster map queries
CREATE INDEX IF NOT EXISTS idx_events_location ON public.events(location_lat, location_lng);

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name IN ('location_lat', 'location_lng');
