-- ========================================
-- LIVETIME - ADD EVENT FEATURES
-- Run this in Supabase SQL Editor to add category, free_food, and event_link
-- ========================================

-- Add category column (with predefined categories)
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add free_food boolean column
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS free_food BOOLEAN DEFAULT false;

-- Add event_link column for external links (RSVP, Instagram, etc.)
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS event_link TEXT;

-- Add index for category filtering
CREATE INDEX IF NOT EXISTS events_category_idx ON public.events(category);

-- Add index for free_food filtering
CREATE INDEX IF NOT EXISTS events_free_food_idx ON public.events(free_food);

-- ========================================
-- DONE! New event features are ready.
-- ========================================
