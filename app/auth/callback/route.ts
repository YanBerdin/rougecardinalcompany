import { createClient } from '@/supabase/server';
import { NextResponse } from 'next/server';
import { SITE_CONFIG } from '@/lib/site-config';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || SITE_CONFIG.AUTH.REDIRECT_TO_DASHBOARD;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[Auth Callback] Error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=callback_error`);
    }

    console.log('[Auth Callback] Session exchanged successfully');
    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  }

  // Pas de code, rediriger vers login
  return NextResponse.redirect(`${requestUrl.origin}/auth/login`);
}