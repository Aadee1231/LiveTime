-- ========================================
-- LIVETIME - ORG/CLUB CREDIBILITY LAYER
-- Run this in Supabase SQL Editor
-- ========================================

-- Step 1: Extend profiles table with organization fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'student' CHECK (account_type IN ('student', 'organization')),
ADD COLUMN IF NOT EXISTS org_name TEXT,
ADD COLUMN IF NOT EXISTS org_username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS org_bio TEXT,
ADD COLUMN IF NOT EXISTS org_avatar_url TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS org_category TEXT,
ADD COLUMN IF NOT EXISTS org_contact_link TEXT;

-- Step 2: Create index on org_username for fast lookups
CREATE INDEX IF NOT EXISTS profiles_org_username_idx ON public.profiles(org_username) WHERE org_username IS NOT NULL;

-- Step 3: Create index on account_type for filtering
CREATE INDEX IF NOT EXISTS profiles_account_type_idx ON public.profiles(account_type);

-- Step 4: Create index on is_verified for filtering verified orgs
CREATE INDEX IF NOT EXISTS profiles_is_verified_idx ON public.profiles(is_verified) WHERE is_verified = true;

-- Step 5: Update events table to include creator profile info in queries
-- (No schema change needed - we'll join with profiles in queries)

-- Step 6: Create a view for easy org discovery (optional but helpful)
CREATE OR REPLACE VIEW public.organizations AS
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
FROM public.profiles
WHERE account_type = 'organization';

-- Step 7: Grant access to the view
GRANT SELECT ON public.organizations TO authenticated;

-- Step 8: Create storage bucket for org avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('org-avatars', 'org-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Step 9: Set up RLS policies for org-avatars bucket
CREATE POLICY "Authenticated users can upload org avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'org-avatars');

CREATE POLICY "Anyone can view org avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'org-avatars');

CREATE POLICY "Users can update own org avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'org-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own org avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'org-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ========================================
-- DONE! Organization support is ready.
-- 
-- USAGE NOTES:
-- - Default users are 'student' type
-- - To create an org: UPDATE profiles SET account_type='organization', org_name='...', org_username='...' WHERE id='...'
-- - To verify an org: UPDATE profiles SET is_verified=true WHERE id='...'
-- - Org avatars stored at: org-avatars/{user_id}/{filename}
-- ========================================
