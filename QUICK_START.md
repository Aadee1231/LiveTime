# LiveTime MiniProjects Migration - Quick Start

## ✅ What's Done

I've already completed:
- ✅ Created database schema SQL (`MINIPROJECTS_LIVETIME_SETUP.sql`)
- ✅ Updated ALL code to use `livetime_` prefixed tables
- ✅ Updated storage bucket references
- ✅ Backed up your old `.env` file

## 🚀 What You Need to Do (5 minutes)

### **Step 1: Delete Old LiveTime Project** (1 min)

1. Go to https://supabase.com/dashboard
2. Switch to "Aadee1231's Org"
3. Click on the old **LiveTime** project
4. Settings → General → Scroll to bottom
5. Click "Delete project" → Type project name to confirm

### **Step 2: Create MiniProjects Supabase Project** (2 min)

1. Click "New project"
2. Fill in:
   - **Name**: `MiniProjects`
   - **Database Password**: Choose a strong password (SAVE THIS!)
   - **Region**: `us-east-1` (or closest to you)
   - **Organization**: `Aadee1231's Org` or `AadeeProjectsV1`
   - **Pricing Plan**: Free
3. Click "Create new project"
4. Wait 2-3 minutes for initialization

### **Step 3: Set Up Database** (1 min)

1. In your new MiniProjects project, click **SQL Editor**
2. Click "New query"
3. Open `MINIPROJECTS_LIVETIME_SETUP.sql` from your project root
4. Copy the ENTIRE file
5. Paste into SQL Editor
6. Click "Run" (or Cmd+Enter)
7. Should see: ✅ "Success. No rows returned"

### **Step 4: Get Credentials** (30 seconds)

1. Click **Settings** → **API**
2. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJ...` (long string)

### **Step 5: Update .env** (30 seconds)

1. Open `web/.env` in your project
2. Replace with your new credentials:

```env
VITE_SUPABASE_URL=https://YOUR_NEW_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...YOUR_NEW_ANON_KEY
```

3. Save the file

### **Step 6: Test** (1 min)

1. Stop dev server if running (Ctrl+C)
2. Clear browser storage:
   - Open DevTools (F12)
   - Application tab → Clear site data
3. Restart dev server:
   ```bash
   cd web
   npm run dev
   ```
4. Open app → Sign up with new account
5. Should load in **under 2 seconds**! 🎉

---

## 🎯 What Changed in Your Code

All table references now use `livetime_` prefix:
- `profiles` → `livetime_profiles`
- `events` → `livetime_events`
- `event-images` → `livetime-event-images`

This allows you to add more mini-projects to the same database later!

---

## 📊 Future Projects

When you build your next project, add it to the same MiniProjects database:

```sql
-- Example: Chat app tables
CREATE TABLE chatapp_messages (...);
CREATE TABLE chatapp_users (...);

-- Example: Task manager tables
CREATE TABLE taskmanager_tasks (...);
CREATE TABLE taskmanager_projects (...);
```

All in one free Supabase project! 🚀

---

## 🆘 Troubleshooting

**"Relation does not exist"**
- You forgot to run `MINIPROJECTS_LIVETIME_SETUP.sql`
- Go back to Step 3

**"Invalid API key"**
- Double-check you copied the anon public key (not service_role)
- Make sure no extra spaces in `.env`

**Still slow/timing out**
- Make sure you deleted the old LiveTime project
- Verify you're using the NEW project URL
- Clear browser cache

---

## ✅ Verification

After setup, check that these work:
- [ ] Sign up/Sign in (fast, no timeouts)
- [ ] Create an event
- [ ] Events show on Home page
- [ ] Events show on Feed page
- [ ] No console errors

---

**Ready? Start with Step 1!** 🚀
