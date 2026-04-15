# Supabase Storage Setup Guide

## Step 1: Run the SQL Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `setup_storage.sql`
4. Click **Run** to execute

This will:
- Create the `event-images` bucket (public)
- Set up RLS policies for authenticated uploads
- Allow public read access to images

## Step 2: Verify Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. You should see a bucket named `event-images`
3. Click on it to verify it's set to **Public**

## Step 3: Test the Upload

1. Start your dev server: `npm run dev`
2. Navigate to `/create`
3. Try uploading an image
4. Check the Supabase Storage dashboard to see the uploaded file

## How It Works

### File Structure
Images are stored at: `event-images/{user_id}/{timestamp}-{random}.{ext}`

Example: `event-images/abc123-def456/1713148800000-x7k9m2.jpg`

### Upload Flow
1. User selects image in Create page
2. Preview shown immediately (client-side)
3. On form submit, image uploads to Supabase Storage
4. Public URL is generated and saved to `events.image_url`
5. Event is created with the image URL

### Security
- Only authenticated users can upload
- Users can only delete their own images
- All images are publicly readable (for event viewing)
- 5MB file size limit enforced client-side

## Troubleshooting

### "Bucket not found" error
- Make sure you ran the SQL setup script
- Check that the bucket name is exactly `event-images`

### "Permission denied" error
- Verify RLS policies are set up correctly
- Make sure user is authenticated

### Image not showing
- Check that the bucket is set to **Public**
- Verify the URL in the database is correct
- Check browser console for CORS errors

## Optional: Set File Size Limits in Supabase

Go to **Storage Settings** and set:
- Max file size: 5MB
- Allowed MIME types: `image/*`
