import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('[Supabase] Initializing client with:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING',
  hasKey: !!supabaseAnonKey,
  env: import.meta.env.MODE
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing environment variables!', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
    allEnvVars: Object.keys(import.meta.env)
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'livetime-web'
    }
  }
});

console.log('[Supabase] Client created successfully');
