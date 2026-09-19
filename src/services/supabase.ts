import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default / environment configured URL and Anon Key
const defaultUrl = import.meta.env.VITE_SUPABASE_URL || '';
const defaultAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Load custom keys from localStorage if saved in settings
const storedUrl = localStorage.getItem('rtw_supabase_url') || defaultUrl;
const storedKey = localStorage.getItem('rtw_supabase_key') || defaultAnonKey;

export let supabase: SupabaseClient | null = null;

if (storedUrl && storedKey && storedUrl.startsWith('http')) {
  try {
    supabase = createClient(storedUrl, storedKey);
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    supabase = null;
  }
}

export function initSupabase(url: string, anonKey: string): boolean {
  if (!url || !anonKey) {
    localStorage.removeItem('rtw_supabase_url');
    localStorage.removeItem('rtw_supabase_key');
    supabase = null;
    return false;
  }

  try {
    supabase = createClient(url, anonKey);
    localStorage.setItem('rtw_supabase_url', url);
    localStorage.setItem('rtw_supabase_key', anonKey);
    return true;
  } catch (err) {
    console.error('Error connecting to Supabase:', err);
    return false;
  }
}

export function isSupabaseConnected(): boolean {
  return supabase !== null;
}
