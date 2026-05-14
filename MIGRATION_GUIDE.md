# LiveTime - MiniProjects Migration Guide

## 🎯 Why We're Migrating
Your current Supabase project exceeded its free tier grace period and is now throttled, causing 10+ second timeouts. 

## 💡 The MiniProjects Strategy
Instead of creating a dedicated project for LiveTime, we're creating a **shared "MiniProjects" database** that can host LiveTime + 5-6 other projects using table prefixes. This keeps you on the free tier!

---

## 📋 Step-by-Step Migration

### **Step 1: Create New Supabase Project**

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New project"** (green button in top right)
3. Fill in the details:
   - **Name**: `MiniProjects` (this will host LiveTime + future projects)
   - **Database Password**: Choose a strong password (SAVE THIS!)
   - **Region**: Choose closest to you (e.g., `us-east-1`)
   - **Pricing Plan**: Free
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to initialize

---

### **Step 2: Get Your New Credentials**

1. Once the project is ready, go to **Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. You'll see:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
4. **Keep this tab open** - you'll need these values!

---

### **Step 3: Set Up Database Schema**

1. In your new MiniProjects project, click **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Open the file `MINIPROJECTS_LIVETIME_SETUP.sql` from your project root
4. **Copy the ENTIRE contents** of `MINIPROJECTS_LIVETIME_SETUP.sql`
5. **Paste it** into the Supabase SQL Editor
6. Click **"Run"** (or press Cmd+Enter)
7. You should see: ✅ **"Success. No rows returned"**

This creates (with `livetime_` prefixes):
- ✅ `livetime_profiles` table
- ✅ `livetime_events` table
- ✅ `livetime-event-images` storage bucket
- ✅ `livetime-org-avatars` storage bucket
- ✅ All indexes and RLS policies
- ✅ Ready for future projects with different prefixes!

---

### **Step 4: Update Your .env File**

1. Open `web/.env` in your project
2. Replace the old values with your new credentials:

```env
VITE_SUPABASE_URL=https://YOUR_NEW_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...YOUR_NEW_ANON_KEY
```

3. **Save the file**

---

### **Step 5: Test the Migration**

1. **Stop your dev server** if it's running (Ctrl+C)
2. **Clear browser storage**:
   - Open DevTools (F12)
   - Go to **Application** tab
   - Click **Clear site data**
   - Click **Clear**
3. **Restart your dev server**:
   ```bash
   cd web
   npm run dev
   ```
4. Open the app in your browser
5. **Sign up with a new account** (use your @ncsu.edu email)
6. You should see:
   - ✅ Fast loading (no timeouts!)
   - ✅ Onboarding flow works
   - ✅ Can create events
   - ✅ Can view feed

---

## 🔍 Verification Checklist

After migration, verify these work:

- [ ] Sign up / Sign in (no 10-second delays)
- [ ] Profile loads quickly
- [ ] Can create an event
- [ ] Events show on Home page
- [ ] Events show on Feed page
- [ ] Image upload works
- [ ] No console errors about timeouts

---

## 🚨 Troubleshooting

### **"Error: relation does not exist"**
- You forgot to run `NEW_PROJECT_SETUP.sql` in the SQL Editor
- Go back to Step 3

### **"Invalid API key"**
- Double-check you copied the **anon public** key (not the service_role key)
- Make sure there are no extra spaces in your `.env` file

### **"CORS error"**
- Your new project URL might not be saved correctly
- Check that `VITE_SUPABASE_URL` starts with `https://`

### **Still getting timeouts**
- Clear browser cache and localStorage
- Make sure you're using the NEW project URL, not the old one
- Restart your dev server

---

## 📊 What About My Old Data?

Since you only have 1 test user and minimal data, it's easier to start fresh. If you need to migrate data:

1. Export from old project:
   - Go to old project → SQL Editor
   - Run: `SELECT * FROM events;` → Export as CSV
   - Run: `SELECT * FROM profiles;` → Export as CSV

2. Import to new project:
   - Use Supabase Table Editor → Import CSV

But for your use case, **starting fresh is recommended**.

---

## ✅ Post-Migration

Once everything works:

1. **Delete the old project** (optional):
   - Go to old project → Settings → General
   - Scroll to bottom → "Delete project"
   - This prevents confusion and frees up a project slot

2. **Update any bookmarks** to point to new dashboard

3. **Monitor usage** in new project:
   - Settings → Usage
   - You'll get warnings before hitting limits

---

## 🚀 Adding Future Projects

When you build your next project (chat app, task manager, etc.), add it to the same MiniProjects database:

```sql
-- Example: Chat app tables
CREATE TABLE chatapp_messages (...);
CREATE TABLE chatapp_users (...);
CREATE TABLE chatapp_channels (...);

-- Example: Task manager tables
CREATE TABLE taskmanager_tasks (...);
CREATE TABLE taskmanager_projects (...);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('chatapp-avatars', 'chatapp-avatars', true);
```

**Benefits:**
- ✅ All projects in one free Supabase project
- ✅ Shared authentication (users can use same account across apps)
- ✅ Stay under free tier limits
- ✅ Easy to manage

---

## 🎉 You're Done!

Your LiveTime app should now load in **under 2 seconds** instead of timing out. You can now build 5-6 more mini-projects in the same database!

**Questions?** Let me know if anything doesn't work!
