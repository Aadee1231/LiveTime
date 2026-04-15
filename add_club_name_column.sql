-- Add club_name column to events table
-- Run this in Supabase SQL Editor

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS club_name TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name = 'club_name';
