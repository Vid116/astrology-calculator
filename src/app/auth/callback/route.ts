import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;
  // Support both 'next' and 'redirect_to' parameters
  const redirectTo = requestUrl.searchParams.get('next')?.toString()
    || requestUrl.searchParams.get('redirect_to')?.toString();

  console.log('[Auth Callback] code:', code ? 'present' : 'missing');
  console.log('[Auth Callback] redirectTo:', redirectTo);

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[Auth Callback] Exchange error:', error.message);
      // Redirect to login with error
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    console.log('[Auth Callback] Session created for:', data.user?.email);
    console.log('[Auth Callback] Access token:', data.session?.access_token ? 'present' : 'missing');
  }

  const destination = redirectTo ? `${origin}${redirectTo}` : origin;
  console.log('[Auth Callback] Redirecting to:', destination);

  return NextResponse.redirect(destination);
}
