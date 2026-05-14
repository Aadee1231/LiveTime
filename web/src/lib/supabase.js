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
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'livetime-auth',
    debug: false
  },
  global: {
    headers: {
      'X-Client-Info': 'livetime-web',
      'Connection': 'keep-alive'
    },
    fetch: (url, options = {}) => {
      console.log('[Supabase] Fetching:', url.substring(url.lastIndexOf('/') + 1));
      return fetch(url, {
        ...options,
        signal: AbortSignal.timeout(5000),
        keepalive: true
      }).catch(err => {
        console.error('[Supabase] Fetch error:', err.message);
        throw err;
      });
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

console.log('[Supabase] Client created successfully');
