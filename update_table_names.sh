#!/bin/bash

# Script to update all table references for MiniProjects database
# Run this from the LiveTime project root directory

echo "🔄 Updating table references to use livetime_ prefix..."

# Update profiles -> livetime_profiles
find web/src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' "s/.from('profiles')/.from('livetime_profiles')/g" {} +
find web/src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/.from("profiles")/.from("livetime_profiles")/g' {} +

# Update events -> livetime_events  
find web/src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' "s/.from('events')/.from('livetime_events')/g" {} +
find web/src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/.from("events")/.from("livetime_events")/g' {} +

# Update foreign key references in select queries
find web/src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/creator:profiles!/creator:livetime_profiles!/g' {} +

# Update storage bucket references
find web/src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' "s/'event-images'/'livetime-event-images'/g" {} +
find web/src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/"event-images"/"livetime-event-images"/g' {} +
find web/src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' "s/'org-avatars'/'livetime-org-avatars'/g" {} +
find web/src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/"org-avatars"/"livetime-org-avatars"/g' {} +

echo "✅ Done! All table references updated."
echo ""
echo "📝 Next steps:"
echo "1. Create 'MiniProjects' Supabase project"
echo "2. Run MINIPROJECTS_LIVETIME_SETUP.sql in SQL Editor"
echo "3. Update web/.env with new credentials"
echo "4. Test the app"
