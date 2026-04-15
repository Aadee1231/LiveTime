-- ========================================
-- LIVETIME MVP v1 - EVENTS TABLE
-- Copy and paste this entire file into Supabase SQL Editor
-- ========================================

-- Step 1: Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location_address TEXT NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  image_url TEXT,
  campus TEXT DEFAULT 'ncsu' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Step 2: Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Step 3: RLS Policy - Anyone authenticated can read events
CREATE POLICY "Authenticated users can read all events"
  ON public.events
  FOR SELECT
  TO authenticated
  USING (true);

-- Step 4: RLS Policy - Users can insert their own events
CREATE POLICY "Users can create events"
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Step 5: RLS Policy - Users can update their own events
CREATE POLICY "Users can update own events"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Step 6: RLS Policy - Users can delete their own events
CREATE POLICY "Users can delete own events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Step 7: Trigger to update updated_at on event changes
CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Step 8: Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS events_creator_id_idx ON public.events(creator_id);
CREATE INDEX IF NOT EXISTS events_start_time_idx ON public.events(start_time);
CREATE INDEX IF NOT EXISTS events_campus_idx ON public.events(campus);
CREATE INDEX IF NOT EXISTS events_created_at_idx ON public.events(created_at DESC);

-- Step 9: Create composite index for common queries (campus + time)
CREATE INDEX IF NOT EXISTS events_campus_time_idx ON public.events(campus, start_time);

-- ========================================
-- DONE! Events table is ready.
-- Next: Copy this SQL and run it in Supabase SQL Editor
-- ========================================
