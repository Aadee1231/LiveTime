# LiveTime Web App

A simple React web app with Supabase backend, ready for Vercel deployment.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Add your Supabase credentials to `.env`:
- Get your Supabase URL and anon key from your Supabase project settings
- Update `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

4. Run the development server:
```bash
npm run dev
```

## Project Structure

```
src/
  components/     # Reusable components (Navbar, etc.)
  pages/          # Page components (Home, Feed, Create, Profile, Auth)
  lib/            # Utilities and configs (Supabase client)
  hooks/          # Custom React hooks
```

## Routes

- `/` - Home (Live Map)
- `/feed` - Event Feed
- `/create` - Create Event
- `/profile` - User Profile
- `/auth` - Login/Signup

## Deployment

This app is configured for Vercel deployment. Simply connect your GitHub repo to Vercel and it will automatically deploy.

Make sure to add your environment variables in Vercel's project settings.
