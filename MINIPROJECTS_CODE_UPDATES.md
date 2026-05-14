# LiveTime - Code Updates for MiniProjects Database

## 🎯 What Changed

Your LiveTime app will now use a **shared Supabase project** called "MiniProjects" with table name prefixes to keep projects separate.

---

## 📝 Required Code Changes

You need to update all Supabase table references from:
- `profiles` → `livetime_profiles`
- `events` → `livetime_events`
- `organizations` → `livetime_organizations`
- `event-images` → `livetime-event-images`
- `org-avatars` → `livetime-org-avatars`

---

## 🔧 Files to Update

### **1. AuthContext.jsx**
**Lines to change:**
- Line 23: `.from('profiles')` → `.from('livetime_profiles')`
- Line 32: `.from('profiles')` → `.from('livetime_profiles')`

### **2. Home.jsx**
**Lines to change:**
- Line 44: `.from('events')` → `.from('livetime_events')`
- Line 47: `creator:profiles!creator_id` → `creator:livetime_profiles!creator_id`

### **3. Feed.jsx**
**Lines to change:**
- Line 62: `.from('events')` → `.from('livetime_events')`
- Line 65: `creator:profiles!creator_id` → `creator:livetime_profiles!creator_id`

### **4. Profile.jsx**
**Lines to change:**
- Line 37: `.from('events')` → `.from('livetime_events')`
- Line 124: `.from('events')` → `.from('livetime_events')`

### **5. Create.jsx**
**Lines to change:**
- Line 185: `.from('events')` → `.from('livetime_events')`

### **6. Onboarding.jsx**
**Lines to change:**
- Line 31: `.from('profiles')` → `.from('livetime_profiles')`
- Line 73: `.from('profiles')` → `.from('livetime_profiles')`

### **7. Settings.jsx**
**Lines to change:**
- Line 36: `.from('profiles')` → `.from('livetime_profiles')`

### **8. OrgProfile.jsx**
**Lines to change:**
- Line 28: `.from('profiles')` → `.from('livetime_profiles')`
- Line 46: `.from('events')` → `.from('livetime_events')`
- Line 49: `creator:profiles!creator_id` → `creator:livetime_profiles!creator_id`

---

## 🚀 Quick Update Method

I can help you update all these files automatically. Just let me know when you're ready!

Alternatively, you can use VS Code's Find & Replace:
1. Press `Cmd+Shift+F` (Find in Files)
2. Search for: `.from('profiles')`
3. Replace with: `.from('livetime_profiles')`
4. Click "Replace All"
5. Repeat for `events`, `organizations`, etc.

---

## ✅ After Updates

1. Create "MiniProjects" Supabase project
2. Run `MINIPROJECTS_LIVETIME_SETUP.sql` in SQL Editor
3. Update `.env` with MiniProjects credentials
4. Test the app

---

## 📊 Benefits of This Approach

✅ **Stay on free tier** - 1 project for multiple apps
✅ **Easy to add new projects** - Just add new prefixed tables
✅ **Shared auth** - Users can have one account across all your mini-projects
✅ **Cost effective** - $0/month for 5-6 projects

---

## 🔮 Future Projects

When you add new mini-projects, use different prefixes:
- `chatapp_messages`, `chatapp_users`
- `taskmanager_tasks`, `taskmanager_projects`
- `socialmedia_posts`, `socialmedia_comments`

All in the same "MiniProjects" database!
