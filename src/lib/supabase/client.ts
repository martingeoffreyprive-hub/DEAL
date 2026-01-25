import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Debug en production
  if (typeof window !== 'undefined') {
    console.log('Supabase URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'UNDEFINED');
    console.log('Supabase Key:', supabaseAnonKey ? 'SET' : 'UNDEFINED');
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(`Supabase config missing: URL=${!!supabaseUrl}, Key=${!!supabaseAnonKey}`);
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
