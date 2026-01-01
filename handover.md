# Google OAuth Handover - Issue Description

## Problem
Google OAuth sign-in is not working properly. When clicking "Continue with Google":
- First click: Redirected to Google, selected account
- Subsequent clicks: Immediately redirected to main page without logging in
- User is NOT logged in after the flow completes

## Error Initially Seen
```json
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```
This was fixed by enabling Google provider in Supabase.

## What's Been Set Up

### Supabase (Dashboard Configuration)
- Project URL: `https://jqebgwzzgggcdaosfglp.supabase.co`
- Google provider: **Enabled** with Client ID and Secret

### Google Cloud Console
- OAuth 2.0 Client ID created
- Authorized redirect URI: `https://jqebgwzzgggcdaosfglp.supabase.co/auth/v1/callback`
- Authorized JavaScript origins: `http://localhost:3000` (and production URL)

### Code Files Involved
1. **Login page** (`src/app/(auth)/login/page.tsx`):
   - `handleGoogleLogin` calls `supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: '${origin}/auth/callback' })`

2. **Signup page** (`src/app/(auth)/signup/page.tsx`):
   - Same Google OAuth implementation

3. **Auth callback** (`src/app/auth/callback/route.ts`):
   - Receives code from OAuth flow
   - Calls `supabase.auth.exchangeCodeForSession(code)`
   - Redirects to home or specified redirect URL
   - Has console logs: `[Auth Callback]`

4. **Middleware** (`src/middleware.ts`):
   - Redirects logged-in users away from `/login` and `/signup` to home
   - Protects `/account` route

5. **AuthProvider** (`src/components/auth/AuthProvider.tsx`):
   - Manages auth state with `onAuthStateChange`
   - Uses `getUser()` to verify session

## Expected Behavior
1. Click "Continue with Google"
2. Redirect to Google account selection
3. Select account
4. Redirect back to `/auth/callback?code=...`
5. Callback exchanges code for session
6. Redirect to home page, logged in

## Actual Behavior
1. Click "Continue with Google"
2. (Sometimes) Redirect to Google, select account
3. Redirect to home page
4. User is NOT logged in

## Debugging Needed
1. Check if `/auth/callback` receives the `code` parameter
2. Check browser console for `[Auth Callback]` logs
3. Check if cookies are being set after `exchangeCodeForSession`
4. Check Network tab to see the full redirect flow
5. Try clearing all cookies and testing fresh

## Environment
- Testing on: `localhost:3000` and production URL
- Both URLs added to Google Cloud Console authorized origins

## Relevant Code Snippets

### Google Login Handler (login/page.tsx)
```tsx
const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) {
    setError(error.message);
  }
};
```

### Auth Callback (auth/callback/route.ts)
```ts
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('[Auth Callback] code:', code ? 'present' : 'missing');

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('[Auth Callback] Exchange error:', error.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
    console.log('[Auth Callback] Session created for:', data.user?.email);
  }

  return NextResponse.redirect(destination);
}
```
