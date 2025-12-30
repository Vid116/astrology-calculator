import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Admin client with service role - use only in server-side code
// This bypasses Row Level Security
// Using 'any' for database type to avoid complex type issues with Supabase queries
// Lazy-loaded to prevent build-time errors when env vars aren't available

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let adminInstance: SupabaseClient<any, 'public', any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabaseAdmin(): SupabaseClient<any, 'public', any> {
  if (!adminInstance) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase environment variables are not set');
    }
    adminInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return adminInstance;
}

// For backwards compatibility, export a proxy that lazily creates the client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin = new Proxy({} as SupabaseClient<any, 'public', any>, {
  get(_, prop) {
    const client = getSupabaseAdmin();
    const value = (client as unknown as Record<string, unknown>)[prop as string];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
