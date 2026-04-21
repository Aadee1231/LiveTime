# Organization / Club Credibility Layer - Implementation Guide

## Overview

This guide documents the organization credibility layer added to LiveTime, which introduces official organization accounts with verification badges, professional profiles, and enhanced trust signals throughout the app.

---

## 🚀 Setup Instructions

### 1. Database Migration

Run the SQL migration in your Supabase SQL Editor:

```bash
# File: org_credibility_migration.sql
```

This migration will:
- Add organization fields to the `profiles` table
- Create indexes for performance
- Set up the `organizations` view
- Create the `org-avatars` storage bucket with RLS policies

### 2. Default Behavior

- **All existing users** are automatically set to `account_type = 'student'`
- **New users** default to `student` type
- **No breaking changes** to existing functionality

---

## 📊 Database Schema

### New Profile Fields

| Field | Type | Description |
|-------|------|-------------|
| `account_type` | TEXT | `'student'` or `'organization'` (default: `'student'`) |
| `org_name` | TEXT | Official organization name |
| `org_username` | TEXT | Unique username/handle (e.g., `@csclub`) |
| `org_bio` | TEXT | Organization description |
| `org_avatar_url` | TEXT | URL to organization logo/avatar |
| `is_verified` | BOOLEAN | Verification status (default: `false`) |
| `org_category` | TEXT | Organization category (optional) |
| `org_contact_link` | TEXT | Contact/website link (optional) |

---

## 🎯 Key Features

### 1. Verified Organization Badges

Organizations can be verified to show a premium badge:

**Component:** `VerifiedBadge.jsx`

```jsx
<VerifiedBadge size="small" />  // 16px
<VerifiedBadge size="default" /> // 20px
<VerifiedBadge size="large" />   // 24px
```

**Where it appears:**
- Event cards (next to org name)
- Event detail modal
- Organization profile page

### 2. Organization Identity Display

**Component:** `OrgIdentity.jsx`

Shows organization name, avatar, verified badge, and username in a clean, clickable format.

```jsx
<OrgIdentity 
  profile={creatorProfile}
  size="small"           // small | default | large
  showAvatar={true}      // Show/hide avatar
  clickable={true}       // Make clickable to navigate to org profile
/>
```

**Where it appears:**
- Event cards (replaces plain club_name text)
- Event detail modal
- Organization profile page

### 3. Organization Profile Pages

**Route:** `/org/:username`

**Component:** `OrgProfile.jsx`

Features:
- Large organization avatar/logo
- Organization name with verified badge
- Username, category, bio
- Contact/website link
- Tabbed view of upcoming and live events
- Clean event grid display

### 4. Enhanced Event Display

Events created by organizations now show:
- Organization avatar (if available)
- Organization name (clickable)
- Verified badge (if verified)
- Professional, trustworthy appearance

**Fallback:** If creator is a student or org data is unavailable, the original `club_name` field is displayed.

### 5. Smart Event Creation

**For Organization Accounts:**
- The "Club/Organization" field is hidden
- Events automatically associate with the org profile
- Org identity is displayed on all events

**For Student Accounts:**
- Original behavior preserved
- Optional "Club/Organization" text field
- Simple text display on events

---

## 🔧 How to Create an Organization

### Option 1: Manual Database Update (MVP Approach)

```sql
-- Update an existing user to be an organization
UPDATE profiles 
SET 
  account_type = 'organization',
  org_name = 'Computer Science Club',
  org_username = 'csclub',
  org_bio = 'Official NCSU Computer Science Club - Building the future of tech',
  org_category = 'Academic',
  is_verified = false  -- Set to true to verify
WHERE id = 'user-uuid-here';
```

### Option 2: Verify an Organization

```sql
-- Verify an organization
UPDATE profiles 
SET is_verified = true 
WHERE org_username = 'csclub';
```

---

## 🎨 UI/UX Design Principles

### Trust Signals
- **Verified badges** use the primary brand color with subtle drop shadow
- **Organization avatars** have gradient backgrounds and clean borders
- **Clickable org names** use primary color to indicate interactivity

### Visual Hierarchy
- Organization identity appears prominently below event titles
- Verified badges are subtle but noticeable
- Consistent spacing and alignment across all views

### Responsive Design
- Organization profile adapts to mobile (stacked layout)
- Event grids adjust to screen size
- Touch-friendly click targets

---

## 🔐 Security & Permissions

### Current Implementation (MVP)
- Organizations are created manually via database
- Verification is managed manually via database
- All authenticated users can view org profiles
- Organizations can only create/edit their own events (via RLS)

### Future-Ready Structure
The code is structured to support:
- Organization onboarding flow
- Multiple admins per organization
- Student following/joining organizations
- Organization admin permissions
- Verification request workflow

---

## 📁 File Structure

```
web/src/
├── components/
│   ├── VerifiedBadge.jsx          # Verified badge component
│   ├── OrgIdentity.jsx            # Org identity display component
│   ├── OrgCredibility.css         # All org-related styles
│   ├── EventCard.jsx              # Updated with org identity
│   └── EventDetailModal.jsx       # Updated with org identity
├── pages/
│   ├── OrgProfile.jsx             # Organization profile page
│   ├── Create.jsx                 # Updated for org posting
│   ├── Feed.jsx                   # Updated to fetch creator profiles
│   └── Home.jsx                   # Updated to fetch creator profiles
├── contexts/
│   └── AuthContext.jsx            # Updated to fetch profile data
└── App.jsx                        # Updated with org routes

Database:
├── org_credibility_migration.sql  # Database migration
└── ORG_CREDIBILITY_GUIDE.md       # This guide
```

---

## 🧪 Testing Checklist

- [ ] Run database migration in Supabase
- [ ] Create a test organization account
- [ ] Verify organization profile page loads
- [ ] Create event as organization
- [ ] Verify org identity shows on event cards
- [ ] Verify org identity shows in event modal
- [ ] Click org name to navigate to profile
- [ ] Test verified badge display
- [ ] Test on mobile devices
- [ ] Verify existing student accounts still work

---

## 🚦 Usage Examples

### Example 1: Create a Verified Organization

```sql
-- Create the Computer Science Club as a verified org
UPDATE profiles 
SET 
  account_type = 'organization',
  org_name = 'Computer Science Club',
  org_username = 'csclub',
  org_bio = 'Official NCSU Computer Science Club. Join us for hackathons, workshops, and networking events!',
  org_category = 'Academic',
  org_contact_link = 'https://csclub.ncsu.edu',
  is_verified = true
WHERE email = 'csclub@ncsu.edu';
```

### Example 2: Upload Organization Avatar

1. Log in as the organization account
2. Navigate to profile settings (future feature)
3. Upload logo to `org-avatars/{user_id}/logo.png`
4. Update profile:

```sql
UPDATE profiles 
SET org_avatar_url = 'https://your-supabase-url/storage/v1/object/public/org-avatars/{user_id}/logo.png'
WHERE id = 'org-user-id';
```

---

## 🎯 Key Benefits

### For Organizations
- **Official presence** on campus event platform
- **Verified badge** builds trust and credibility
- **Professional profile** showcases brand and mission
- **Event discovery** through clickable org names
- **Centralized event listing** on org profile page

### For Students
- **Trust signals** help identify official events
- **Easy discovery** of organization events
- **Professional appearance** increases event credibility
- **Direct access** to org profiles and contact info

### For Platform Growth
- **Adoption incentive** for clubs and organizations
- **Quality signal** for events
- **Network effects** through org profiles
- **Future expansion** ready (following, memberships, etc.)

---

## 🔮 Future Enhancements

The current implementation is structured to support:

1. **Organization Onboarding**
   - Self-service org account creation
   - Verification request workflow
   - Admin approval system

2. **Multi-Admin Support**
   - Multiple users can manage one org
   - Role-based permissions
   - Admin invitations

3. **Student Engagement**
   - Follow/join organizations
   - Organization member lists
   - Member-only events

4. **Analytics**
   - Event performance metrics
   - Follower growth tracking
   - Engagement insights

5. **Advanced Features**
   - Organization categories/tags
   - Featured organizations
   - Organization search/discovery
   - Org-to-org networking

---

## 🐛 Troubleshooting

### Organization profile not loading
- Verify `org_username` is set and unique
- Check that `account_type = 'organization'`
- Ensure user is authenticated

### Verified badge not showing
- Confirm `is_verified = true` in database
- Check that profile data is being fetched
- Verify CSS is imported in App.jsx

### Events not showing org identity
- Ensure events query includes creator profile join
- Check that `creatorProfile` prop is passed to EventCard
- Verify profile has `account_type = 'organization'`

### Club name still showing for orgs
- Check conditional logic in EventCard
- Verify `creatorProfile?.account_type === 'organization'`
- Ensure profile data is correctly structured

---

## 📞 Support

For questions or issues:
1. Check this guide
2. Review the code comments
3. Test with a sample organization account
4. Verify database migration completed successfully

---

## ✅ Summary

The organization credibility layer adds:
- ✅ Account type distinction (student vs organization)
- ✅ Verified organization badges
- ✅ Professional organization profiles
- ✅ Enhanced event trust signals
- ✅ Clickable org discovery
- ✅ Future-ready architecture
- ✅ Zero breaking changes
- ✅ MVP-friendly implementation

**Status:** Ready for production use 🚀
