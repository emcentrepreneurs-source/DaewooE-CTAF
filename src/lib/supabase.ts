import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialized Supabase client
let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return null;
  }

  try {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return supabaseClient;
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
    return null;
  }
}

export const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return Boolean(url && key);
};
