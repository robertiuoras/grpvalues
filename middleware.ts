// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get authentication status directly from the 'isAuthenticated' cookie.
  // The 'useAuth' hook in the client-side manages the expiry and clears this cookie.
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';
  const pathname = request.nextUrl.pathname;

  // 1. If the user is NOT authenticated AND is trying to access any page EXCEPT the login page,
  //    redirect them to the login page. This ensures all protected routes (including '/') redirect instantly.
  if (!isAuthenticated && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If the user IS authenticated AND is trying to access the login page,
  //    redirect them to the home page (or a main dashboard if you have one).
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. For all other cases (authenticated users on non-login pages, or unauthenticated users on the login page),
  //    allow the request to proceed.
  return NextResponse.next();
}

// Define which paths the middleware should run on.
// This will run on all paths except Next.js internal files, static assets, and API routes.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/ (internal Next.js files like static assets, image optimization)
     * - api/ (your API routes - these should handle their own auth/RBAC checks internally)
     * - Any other public assets or files that do not require authentication.
     */
    '/((?!_next|api).*)', // This broadly matches all pages (including root) but excludes internal Next.js and API routes
  ],
};
