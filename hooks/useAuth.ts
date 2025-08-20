// hooks/useAuth.ts
"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null); // FIX: Added userRole state
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuthentication = () => {
      const authStatus = Cookies.get('isAuthenticated');
      const authTimestamp = Cookies.get('authTimestamp');
      const roleCookie = Cookies.get('userRole'); // FIX: Read userRole from cookie

      let userIsAuthenticated = false;
      let role = null; // Initialize role

      if (authStatus === 'true' && authTimestamp) {
        const now = new Date().getTime();
        const authTime = parseInt(authTimestamp);
        const hoursSinceAuth = (now - authTime) / (1000 * 60 * 60);

        // Check if the session has expired (e.g., after 1 hour)
        if (hoursSinceAuth < 1) { // Changed from 24 hours to 1 hour
          userIsAuthenticated = true;
          role = roleCookie || null; // FIX: Assign role from cookie
        } else {
          // Session expired, clear cookies
          console.log('useAuth: Client-side session expired after 1 hour. Clearing cookies.');
          Cookies.remove('isAuthenticated');
          Cookies.remove('authTimestamp');
          Cookies.remove('userRole'); // FIX: Also clear userRole cookie on expiry
        }
      }

      setIsAuthenticated(userIsAuthenticated);
      setUserRole(role); // FIX: Set the userRole state
      setIsLoading(false);

      // Redirect if not authenticated AND not already on the login page
      if (!userIsAuthenticated && pathname !== '/login') {
        router.replace('/login');
      } 
      // If authenticated and on the login page, redirect to home
      else if (userIsAuthenticated && pathname === '/login') {
        router.replace('/');
      }
    };

    // Run the check immediately and then every few seconds to catch expiry
    checkAuthentication(); 
    const intervalId = setInterval(checkAuthentication, 30 * 1000); // Check every 30 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [router, pathname]); // FIX: Reverted dependencies to only router and pathname

  return { isAuthenticated, isLoading, userRole, setIsAuthenticated }; // FIX: Return userRole
}
