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
    console.log("useAuth: useEffect triggered.");
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
      );

      let userIsAuthenticated = false;
      let role = null;

      if (authStatus === "true" && authTimestamp) {
        const now = new Date().getTime();
        const authTime = parseInt(authTimestamp);
        const hoursSinceAuth = (now - authTime) / (1000 * 60 * 60);

        console.log("useAuth: Hours since last auth:", hoursSinceAuth);

        if (hoursSinceAuth < 1) {
          // Current session expiry is 1 hour
          userIsAuthenticated = true;
          role = roleCookie || null;
          console.log("useAuth: Session is active.");
        } else {
          console.log(
            "useAuth: Client-side session expired after 1 hour. Clearing cookies."
          );
          Cookies.remove("isAuthenticated");
          Cookies.remove("authTimestamp");
          Cookies.remove("userRole");
        }
      } else {
        console.log(
          "useAuth: No valid authentication cookies found (authStatus or authTimestamp missing/invalid)."
        );
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
      );

      // Redirect if not authenticated AND not already on the login page
      // Added a small setTimeout to mitigate race conditions on Vercel deployment
      if (!userIsAuthenticated && pathname !== "/login") {
        console.log(
          "useAuth: Not authenticated and not on login page. Scheduling redirect to /login."
        );
        setTimeout(() => {
          router.replace("/login");
        }, 50); // Small delay
      }
      // If authenticated and on the login page, redirect to home
      else if (userIsAuthenticated && pathname === "/login") {
        console.log(
          "useAuth: Authenticated on login page. Scheduling redirect to /."
        );
        setTimeout(() => {
          router.replace("/");
        }, 50); // Small delay
      } else {
        console.log(
          "useAuth: No redirect needed based on current state and path."
        );
      }
    };

    // Run the check immediately and then every few seconds to catch expiry
    checkAuthentication();
    const intervalId = setInterval(checkAuthentication, 30 * 1000); // Check every 30 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [router, pathname]); // Re-added 'pathname' to dependencies

  return { isAuthenticated, isLoading, userRole, setIsAuthenticated };
}
