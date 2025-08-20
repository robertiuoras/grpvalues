// app/logout/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers'; // Import cookies for server-side access

export async function GET(request: NextRequest) {
  // FIX: Await cookies() to resolve the Promise<ReadonlyRequestCookies> type error
  const cookieStore = await cookies();

  // Clear all relevant authentication cookies
  cookieStore.delete('isAuthenticated');
  cookieStore.delete('authTimestamp');
  cookieStore.delete('userRole');

  // Create a response that redirects to the login page
  const redirectUrl = new URL('/login', request.url);
  const response = NextResponse.redirect(redirectUrl);

  // Return the redirect response. The cookies are cleared by the delete calls above.
  return response;
}
