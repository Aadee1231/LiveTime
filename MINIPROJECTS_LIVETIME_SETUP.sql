-- ========================================
-- LIVETIME - COMPLETE DATABASE SETUP
-- Run this ENTIRE file in your NEW Supabase project's SQL Editor
-- ========================================

-- ========================================
-- PART 1: PROFILES TABLE SETUP
-- ========================================

-- Step 1: Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create livetime_profiles table with ALL fields
CREATE TABLE IF NOT EXISTS public.livetime_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Onboarding & Interests
  onboarding_completed BOOLEAN DEFAULT false,
  interests TEXT[] DEFAULT '{}',
  preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Organization fields
  account_type TEXT DEFAULT 'student' CHECK (account_type IN ('student', 'organization')),
  org_name TEXT,
  org_username TEXT UNIQUE,
  org_bio TEXT,
  org_avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  org_category TEXT,
  org_contact_link TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Step 3: Enable RLS on livetime_profiles
ALTER TABLE public.livetime_profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: RLS Policies for livetime_profiles
CREATE POLICY "Users can view all livetime_profiles"
  ON public.livetime_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own livetime_profile"
  ON public.livetime_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own livetime_profile"
  ON public.livetime_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Step 5: Create trigger for livetime_profiles updated_at
CREATE TRIGGER set_livetime_profiles_updated_at
  BEFORE UPDATE ON public.livetime_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Step 6: Create indexes on livetime_profiles
CREATE INDEX IF NOT EXISTS livetime_profiles_onboarding_idx ON public.livetime_profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS livetime_profiles_interests_idx ON public.livetime_profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS livetime_profiles_org_username_idx ON public.livetime_profiles(org_username) WHERE org_username IS NOT NULL;
CREATE INDEX IF NOT EXISTS livetime_profiles_account_type_idx ON public.livetime_profiles(account_type);
CREATE INDEX IF NOT EXISTS livetime_profiles_verified_idx ON public.livetime_profiles(is_verified) WHERE is_verified = true;

-- ========================================
-- PART 2: EVENTS TABLE SETUP
-- ========================================

-- Step 7: Create livetime_events table with ALL fields
CREATE TABLE IF NOT EXISTS public.livetime_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.livetime_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location_address TEXT NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  image_url TEXT,
  campus TEXT DEFAULT 'ncsu' NOT NULL,
  
  -- Additional fields
  club_name TEXT,
  category TEXT,
  free_food BOOLEAN DEFAULT false,
  event_link TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Step 8: Enable RLS on livetime_events
ALTER TABLE public.livetime_events ENABLE ROW LEVEL SECURITY;

-- Step 9: RLS Policies for livetime_events
CREATE POLICY "Authenticated users can read all livetime_events"
  ON public.livetime_events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create livetime_events"
  ON public.livetime_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own livetime_events"
  ON public.livetime_events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can delete own livetime_events"
  ON public.livetime_events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Step 10: Create trigger for livetime_events updated_at
CREATE TRIGGER set_livetime_events_updated_at
  BEFORE UPDATE ON public.livetime_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Step 11: Create indexes on livetime_events
CREATE INDEX IF NOT EXISTS livetime_events_creator_idx ON public.livetime_events(creator_id);
CREATE INDEX IF NOT EXISTS livetime_events_start_time_idx ON public.livetime_events(start_time);
CREATE INDEX IF NOT EXISTS livetime_events_campus_idx ON public.livetime_events(campus);
CREATE INDEX IF NOT EXISTS livetime_events_created_at_idx ON public.livetime_events(created_at DESC);
CREATE INDEX IF NOT EXISTS livetime_events_campus_time_idx ON public.livetime_events(campus, start_time);
CREATE INDEX IF NOT EXISTS livetime_events_category_idx ON public.livetime_events(category);
CREATE INDEX IF NOT EXISTS livetime_events_free_food_idx ON public.livetime_events(free_food);

-- ========================================
-- PART 3: ORGANIZATIONS VIEW
-- ========================================

-- Step 12: Create livetime_organizations view
CREATE OR REPLACE VIEW public.livetime_organizations AS
SELECT 
  id,
  org_name,
  org_username,
  org_bio,
  org_avatar_url,
  is_verified,
  org_category,
  org_contact_link,
  created_at
FROM public.livetime_profiles
WHERE account_type = 'organization';

-- Step 13: Grant access to the view
GRANT SELECT ON public.livetime_organizations TO authenticated;

-- ========================================
-- PART 4: STORAGE BUCKETS
-- ========================================

-- Step 14: Create livetime-event-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('livetime-event-images', 'livetime-event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Step 15: Create livetime-org-avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('livetime-org-avatars', 'livetime-org-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Step 16: RLS policies for livetime-event-images bucket
CREATE POLICY "Authenticated users can upload livetime event images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'livetime-event-images');

CREATE POLICY "Anyone can view livetime event images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'livetime-event-images');

CREATE POLICY "Users can update own livetime event images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'livetime-event-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own livetime event images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'livetime-event-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Step 17: RLS policies for livetime-org-avatars bucket
CREATE POLICY "Authenticated users can upload livetime org avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'livetime-org-avatars');

CREATE POLICY "Anyone can view livetime org avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'livetime-org-avatars');

CREATE POLICY "Users can update own livetime org avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'livetime-org-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own livetime org avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'livetime-org-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ========================================
-- DONE! LiveTime is ready in MiniProjects database
-- 
-- Table names use 'livetime_' prefix to avoid conflicts with future projects
-- Storage buckets use 'livetime-' prefix
-- 
-- Next steps:
-- 1. Update your .env file with MiniProjects credentials
-- 2. Test authentication
-- 3. Create a test event
-- 
-- Future projects: Add tables with different prefixes (chatapp_, taskmanager_, etc.)
-- ========================================
