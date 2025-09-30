import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Try multiple sources; avoid crashing preview if not configured
const supabaseUrl = (window as any)?.__SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = (window as any)?.__SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} else {
  // Graceful fallback to avoid breaking the preview when not configured
  console.warn('Supabase not configured. Preview will run without backend.');
  const noop = async () => ({ data: null, error: new Error('Backend not configured') });
  // Minimal shim to satisfy current app usage
  supabase = {
    auth: {
      signInWithPassword: noop as any,
      signUp: noop as any,
      signOut: noop as any,
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  } as unknown as SupabaseClient;
}

export { supabase };
