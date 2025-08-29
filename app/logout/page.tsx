// app/logout/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import Cookies from "js-cookie";

export default function LogoutPage() {
  const [status, setStatus] = useState("Logging you out...");
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Call the server-side logout API
        const response = await fetch("/api/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Clear all client-side cookies
          Cookies.remove("isAuthenticated");
          Cookies.remove("authTimestamp");
          Cookies.remove("userRole");
          Cookies.remove("accessCode"); // Remove the new accessCode cookie

          setStatus("Logged out successfully! Redirecting...");
          // Redirect to the login page after a short delay
          setTimeout(() => {
            router.push("/login");
          }, 1500);
        } else {
          setStatus("Logout failed. Please try again.");
          console.error("Logout API failed:", data.message);
        }
      } catch (error) {
        setStatus("An error occurred during logout.");
        console.error("Logout error:", error);
      }
    };

    handleLogout();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8 text-center">
        <Lock size={60} className="text-red-400 mx-auto mb-5 animate-pulse" />
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-wide">
          Logging Out
        </h1>
        <p className="text-gray-300 text-lg">{status}</p>
        <div className="mt-6">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
