// hooks/useAuth.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("useAuth: useEffect triggered."); // Added log
    const checkAuthentication = () => {
      const authStatus = Cookies.get("isAuthenticated");
      const authTimestamp = Cookies.get("authTimestamp");
      const roleCookie = Cookies.get("userRole");

      console.log(
        "useAuth: Cookie values - isAuthenticated:",
        authStatus,
        "authTimestamp:",
        authTimestamp,
        "userRole:",
        roleCookie
      ); // Added log

      let userIsAuthenticated = false;
      let role = null;

      if (authStatus === "true" && authTimestamp) {
        const now = new Date().getTime();
        const authTime = parseInt(authTimestamp);
        const hoursSinceAuth = (now - authTime) / (1000 * 60 * 60);

        console.log("useAuth: Hours since last auth:", hoursSinceAuth); // Added log

        // Check if the session has expired (e.g., after 1 hour)
        if (hoursSinceAuth < 1) {
          // Current session expiry is 1 hour
          userIsAuthenticated = true;
          role = roleCookie || null;
          console.log("useAuth: Session is active."); // Added log
        } else {
          // Session expired, clear cookies
          console.log(
            "useAuth: Client-side session expired after 1 hour. Clearing cookies."
          ); // Added log
          Cookies.remove("isAuthenticated");
          Cookies.remove("authTimestamp");
          Cookies.remove("userRole");
        }
      } else {
        console.log(
          "useAuth: No valid authentication cookies found (authStatus or authTimestamp missing/invalid)."
        ); // Added log
      }

      setIsAuthenticated(userIsAuthenticated);
      setUserRole(role);
      setIsLoading(false);
      console.log(
        "useAuth: State updated - isAuthenticated:",
        userIsAuthenticated,
        "userRole:",
        role,
        "isLoading:",
        false
      ); // Added log

      // Redirect if not authenticated AND not already on the login page
      if (!userIsAuthenticated && pathname !== "/login") {
        console.log(
          "useAuth: Not authenticated and not on login page. Redirecting to /login."
        ); // Added log
        router.replace("/login");
      }
      // If authenticated and on the login page, redirect to home
      else if (userIsAuthenticated && pathname === "/login") {
        console.log("useAuth: Authenticated on login page. Redirecting to /."); // Added log
        router.replace("/");
      } else {
        console.log(
          "useAuth: No redirect needed based on current state and path."
        ); // Added log
      }
    };

    // Run the check immediately and then every few seconds to catch expiry
    checkAuthentication();
    const intervalId = setInterval(checkAuthentication, 30 * 1000); // Check every 30 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [router]); // Removed 'pathname' from dependencies

  return { isAuthenticated, isLoading, userRole, setIsAuthenticated };
}
