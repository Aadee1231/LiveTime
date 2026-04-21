-- ========================================
-- LIVETIME - ONBOARDING & INTERESTS SYSTEM
-- Run this in Supabase SQL Editor
-- ========================================

-- Step 1: Add onboarding and preferences fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Step 2: Create index on onboarding_completed for filtering
CREATE INDEX IF NOT EXISTS profiles_onboarding_completed_idx 
ON public.profiles(onboarding_completed);

-- Step 3: Create index on interests for array operations
CREATE INDEX IF NOT EXISTS profiles_interests_idx 
ON public.profiles USING GIN(interests);

-- Step 4: Add helpful comment
COMMENT ON COLUMN public.profiles.interests IS 'Array of user interest categories (e.g., social, sports, food, academic, etc.)';
COMMENT ON COLUMN public.profiles.preferences IS 'JSON object storing user preferences like event_radius, preferred_times, show_live_first, etc.';
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Whether user has completed the initial onboarding flow';

-- ========================================
-- DONE! Onboarding & Interests support is ready.
-- 
-- USAGE NOTES:
-- - New users default to onboarding_completed=false
-- - interests is an array: ['social', 'sports', 'food']
-- - preferences is a JSON object: {"event_radius": 5, "preferred_times": ["morning", "evening"], "show_live_first": true}
-- - Update interests: UPDATE profiles SET interests = ARRAY['social', 'sports'] WHERE id = '...'
-- - Update preferences: UPDATE profiles SET preferences = '{"event_radius": 10}'::jsonb WHERE id = '...'
-- ========================================
