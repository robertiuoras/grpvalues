"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("useAuth: useEffect triggered.");
    const checkAuthentication = () => {
      // Check for admin authentication only
      const authStatus = Cookies.get("isAuthenticated");
      const roleCookie = Cookies.get("userRole");
      const idCookie = Cookies.get("userId");

      console.log(
        "useAuth: Cookie values - isAuthenticated:",
        authStatus,
        "userRole:",
        roleCookie,
        "userId:",
        idCookie
      );

      let userIsAuthenticated = false;
      let role = null;
      let currentUserId = null;

      // Check for admin authentication
      if (authStatus === "true" && roleCookie === "admin") {
        userIsAuthenticated = true;
        role = "admin";
        currentUserId = idCookie || null;
        console.log("useAuth: Admin authentication found");
      }

      // Only update state if values have changed to prevent infinite re-renders
      setIsAuthenticated(prev => prev !== userIsAuthenticated ? userIsAuthenticated : prev);
      setUserRole(prev => prev !== role ? role : prev);
      setUserId(prev => prev !== currentUserId ? currentUserId : prev);
      setIsLoading(false);
    };

    checkAuthentication();
  }, []);

  const login = async (accessCode: string) => {
    console.log("useAuth: Login attempt with code:", accessCode);
    setIsLoading(true);

    try {
      const response = await fetch("/api/verify-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: accessCode.trim() }),
        cache: "no-store",
      });

      const data = await response.json();
      console.log("useAuth: Login response:", data);

      if (response.ok && data.success) {
        // Only set cookies for admin users
        if (data.userRole === "admin") {
          Cookies.set("isAuthenticated", "true", { expires: 1 });
          Cookies.set("authTimestamp", new Date().getTime().toString(), {
            expires: 1,
          });
          Cookies.set("userRole", data.userRole, { expires: 1 });
          if (data.userId) {
            Cookies.set("userId", data.userId, { expires: 1 });
          }
          
          setIsAuthenticated(true);
          setUserRole(data.userRole);
          setUserId(data.userId || null);
          
          console.log("useAuth: Admin login successful");
          return { success: true };
        } else {
          console.log("useAuth: Non-admin login rejected");
          return { success: false, message: "Only admin access is allowed" };
        }
      } else {
        console.log("useAuth: Login failed:", data.message);
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("useAuth: Login error:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log("useAuth: Logout called");
    
    // Clear all cookies
    Cookies.remove("isAuthenticated");
    Cookies.remove("authTimestamp");
    Cookies.remove("userRole");
    Cookies.remove("userId");
    
    // Reset state
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    
    // Force page reload to ensure state is properly updated
    window.location.href = "/";
  };

  // Check if user is admin
  const isAdmin = userRole === "admin";

  return {
    isAuthenticated,
    isLoading,
    userRole,
    userId,
    isAdmin,
    login,
    logout,
  };
}