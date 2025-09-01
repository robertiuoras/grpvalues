"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // New state for userId
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("useAuth: useEffect triggered.");
    const checkAuthentication = () => {
      const authStatus = Cookies.get("isAuthenticated");
      const authTimestamp = Cookies.get("authTimestamp");
      const roleCookie = Cookies.get("userRole");
      const idCookie = Cookies.get("userId"); // Read userId from cookie

      console.log(
        "useAuth: Cookie values - isAuthenticated:",
        authStatus,
        "authTimestamp:",
        authTimestamp,
        "userRole:",
        roleCookie,
        "userId:", // Log userId cookie value
        idCookie
      );

      let userIsAuthenticated = false;
      let role = null;
      let currentUserId = null; // Variable to hold the userId

      if (authStatus === "true" && authTimestamp && idCookie) {
        // Check for userId cookie too
        const now = new Date().getTime();
        const authTime = parseInt(authTimestamp);
        const hoursSinceAuth = (now - authTime) / (1000 * 60 * 60);

        console.log("useAuth: Hours since last auth:", hoursSinceAuth);

        if (hoursSinceAuth < 1) {
          // Current session expiry is 1 hour
          userIsAuthenticated = true;
          role = roleCookie || null;
          currentUserId = idCookie; // Set userId if session is active
          console.log("useAuth: Session is active.");
        } else {
          console.log(
            "useAuth: Client-side session expired after 1 hour. Clearing cookies and cleaning up Firestore."
          );

          // Clean up Firestore before clearing cookies
          if (idCookie) {
            fetch("/api/cleanup-session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accessCodeId: idCookie }),
            }).catch((error) => {
              console.error(
                "useAuth: Failed to cleanup session in Firestore:",
                error
              );
            });
          }

          Cookies.remove("isAuthenticated");
          Cookies.remove("authTimestamp");
          Cookies.remove("userRole");
          Cookies.remove("userId"); // Clear userId cookie on expiry
        }
      } else {
        console.log(
          "useAuth: No valid authentication cookies found (authStatus, authTimestamp, or userId missing/invalid)."
        );
      }

      // Check if access codes are required
      const accessCodeRequired = Cookies.get("accessCodeRequired");
      const codesNotRequired = accessCodeRequired === "false";
      
      // Always update state
      setIsAuthenticated(userIsAuthenticated);
      setUserRole(role);
      setUserId(currentUserId); // Update userId state
      setIsLoading(false);
      
      // If access codes are not required, skip authentication enforcement but maintain state
      if (codesNotRequired) {
        console.log(
          "useAuth: Access codes not required, skipping authentication enforcement but maintaining state."
        );
        return;
      }
      console.log(
        "useAuth: State updated - isAuthenticated:",
        userIsAuthenticated,
        "userRole:",
        role,
        "userId:", // Log updated userId state
        currentUserId,
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

  // Add heartbeat system to prevent codes from getting stuck
  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    // Send heartbeat every 2 minutes to keep the session active
    const heartbeatInterval = setInterval(async () => {
      try {
        // Update lastUsed timestamp to prevent the code from being marked as stuck
        const response = await fetch("/api/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessCodeId: userId }),
        });

        if (!response.ok) {
          console.warn("useAuth: Heartbeat failed, session may be stale");
        }
      } catch (error) {
        console.error("useAuth: Heartbeat error:", error);
      }
    }, 2 * 60 * 1000); // Every 2 minutes

    // Handle browser close/tab close to clean up immediately
    const handleBeforeUnload = () => {
      if (userId) {
        // Send a synchronous request to clean up immediately
        navigator.sendBeacon(
          "/api/cleanup-session",
          JSON.stringify({ accessCodeId: userId })
        );
      }
    };

    // Handle page visibility change (tab switching, minimizing)
    const handleVisibilityChange = () => {
      if (document.hidden && userId) {
        // Tab is hidden, send cleanup request
        fetch("/api/cleanup-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessCodeId: userId }),
        }).catch(console.error);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, userId]);

  return { isAuthenticated, isLoading, userRole, userId, setIsAuthenticated }; // Return userId
}
