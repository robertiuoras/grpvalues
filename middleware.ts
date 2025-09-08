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