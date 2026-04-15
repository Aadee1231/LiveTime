-- ========================================
-- LIVETIME MVP v1 - STORAGE SETUP
-- Run this in Supabase SQL Editor
-- ========================================

-- Step 1: Create the event-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Set up RLS policies for the bucket

-- Policy: Anyone authenticated can upload images
CREATE POLICY "Authenticated users can upload event images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

-- Policy: Anyone can view event images (public bucket)
CREATE POLICY "Anyone can view event images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'event-images');

-- Policy: Users can update their own uploaded images
CREATE POLICY "Users can update own event images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Users can delete their own uploaded images
CREATE POLICY "Users can delete own event images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'event-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ========================================
-- DONE! Storage bucket is ready.
-- Images will be stored at: event-images/{user_id}/{filename}
-- ========================================
