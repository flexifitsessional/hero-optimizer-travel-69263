import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vdvgrdwauxfzljgdahju.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdmdyZHdhdXhmemxqZ2RhaGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMTIwNzUsImV4cCI6MjA3NDc4ODA3NX0.S8kPUAquQsGKdzOAyF--P6YnysMyh9eiJxiH9SENbpk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});


