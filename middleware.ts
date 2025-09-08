// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Admin routes that require admin authentication
  const adminRoutes = ['/admin'];
  
  // Check if this is an admin route
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  
  if (isAdminRoute) {
    // Check for admin authentication
    const isAdminAuthenticated = request.cookies.get("isAuthenticated")?.value === "true";
    const userRole = request.cookies.get("userRole")?.value;
    
    // Only allow access if user is authenticated as admin
    if (!isAdminAuthenticated || userRole !== "admin") {
      // Redirect to login page for admin authentication
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  
  // Track visitor activity for all page visits (not API calls)
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/_next/') && !pathname.includes('.')) {
    try {
      // Get client IP
      const clientIP = request.headers.get("x-forwarded-for") || 
                       request.headers.get("x-real-ip") || 
                       "unknown";

      // Get user agent
      const userAgent = request.headers.get("user-agent") || "unknown";

      // Get current timestamp
      const timestamp = new Date().toISOString();

      // Record this visit asynchronously (don't wait for it)
      fetch(`${request.nextUrl.origin}/api/track-visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip: clientIP,
          userAgent,
          timestamp,
          page: pathname,
        }),
      }).catch(error => {
        // Silently fail if tracking fails
        console.error('Failed to track visit:', error);
      });
    } catch (error) {
      // Silently fail if tracking fails
      console.error('Error in visitor tracking:', error);
    }
  }
  
  // For all other routes, allow access without authentication
  // The site is now fully public except for admin areas
  return NextResponse.next();
}

// Define which paths the middleware should run on
export const config = {
  matcher: [
    // Match all paths except Next.js internal files, static assets, and API routes
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};