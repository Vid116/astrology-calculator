import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

let client: SupabaseClient<Database> | null = null;

export function createClient(): SupabaseClient<Database> {
  // Check if we're in a browser environment and have the required env vars
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client for build time - it will be replaced on the client
    if (typeof window === 'undefined') {
      // During SSR/build, return a minimal mock
      return {
        auth: {
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signOut: async () => ({ error: null }),
          signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
          signUp: async () => ({ data: { user: null, session: null }, error: null }),
          signInWithOAuth: async () => ({ data: { provider: '', url: '' }, error: null }),
        },
        from: () => ({
          select: () => ({ eq: () => ({ in: () => ({ order: () => ({ limit: () => ({ single: async () => ({ data: null, error: null }) }) }) }), single: async () => ({ data: null, error: null }) }) }),
          upsert: async () => ({ data: null, error: null }),
          insert: async () => ({ data: null, error: null }),
          update: () => ({ eq: async () => ({ data: null, error: null }) }),
          delete: () => ({ eq: async () => ({ data: null, error: null }) }),
        }),
      } as unknown as SupabaseClient<Database>;
    }
    throw new Error('Supabase environment variables are not set');
  }

  // Create a singleton client on the browser
  if (!client) {
    client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  return client;
}
