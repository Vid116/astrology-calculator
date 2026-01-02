import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getRandomAvatarPath } from '@/lib/avatars';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;
  // Support both 'next' and 'redirect_to' parameters
  const redirectTo = requestUrl.searchParams.get('next')?.toString()
    || requestUrl.searchParams.get('redirect_to')?.toString();

  const destination = redirectTo ? `${origin}${redirectTo}` : origin;

  // Create the redirect response FIRST so we can set cookies on it
  const response = NextResponse.redirect(destination);

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
            // Set cookies on BOTH the cookieStore (for server) AND the response (for browser)
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // Redirect to login with error
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    // For OAuth users, assign a random planet avatar if they don't have a profile yet
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', user.id)
        .single();

      // New user - no profile yet, create one with random planet
      if (!profile) {
        await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            avatar_url: getRandomAvatarPath()
          });
      }
    }
  }

  // Prevent caching of the redirect response
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache');

  return response;
}
