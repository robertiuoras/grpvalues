// app/admin/active-users/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth"; // Adjust path as needed
import {
  Users,
  AlertCircle,
  Ban,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface ActiveUser {
  accessCodeId: string;
  playerId: string | null;
  is_in_use: boolean; // Indicates if currently logged in
  lastUsed: string | null; // Last activity timestamp
  isRecentlyActive: boolean; // True if lastUsed within defined window
  isActiveCode: boolean; // True if the code itself is marked as active in Firestore
}

export default function ActiveUsersPage() {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const [users, setUsers] = useState<ActiveUser[]>([]); // Renamed from activeUsers to users
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);
  const [accessCodeRequired, setAccessCodeRequired] = useState<boolean>(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [toggleMessage, setToggleMessage] = useState<string | null>(null);

  // Helper function to format time properly
  const formatTime = (timeString: string | null) => {
    if (!timeString || timeString === "Never") return "Never";

    try {
      // Check if it's a timestamp (number as string)
      let date: Date;
      if (/^\d+$/.test(timeString)) {
        // It's a timestamp, create date from it
        date = new Date(parseInt(timeString));
      } else {
        // It's an ISO string or other format
        date = new Date(timeString);
      }

      if (isNaN(date.getTime())) return timeString;

      // Format with explicit 12-hour format and local timezone
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  useEffect(() => {
    if (isAuthenticated && userRole === "admin" && !isLoading) {
      const fetchUsersData = async () => {
        // Renamed from fetchActiveUsers to fetchUsersData
        setFetchLoading(true);
        setFetchError(null);
        try {
          const response = await fetch("/api/get-active-users");
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `HTTP ${response.status}: ${errorText || response.statusText}`
            );
          }
          const data = await response.json();

          console.log("API Response Data:", data);

          if (data.success) {
            console.log("Users data received:", data.users);
            setUsers(data.users); // Update 'users' state
          } else {
            setFetchError(data.message || "Failed to fetch users data.");
            console.error("API reported failure:", data.message);
          }
        } catch (error: any) {
          console.error("Error fetching users data from client:", error);
          setFetchError(
            `Could not load users data: ${error.message || "Unknown error"}`
          );
        } finally {
          setFetchLoading(false);
        }
      };

      const fetchAccessCodeRequirement = async () => {
        try {
          const response = await fetch("/api/admin/access-code-requirement");
          if (response.ok) {
            const data = await response.json();
            setAccessCodeRequired(data.required);

            // Set a cookie that the middleware can read
            document.cookie = `accessCodeRequired=${
              data.required
            }; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
          }
        } catch (error) {
          console.error("Error fetching access code requirement:", error);
        }
      };

      fetchUsersData(); // Initial fetch
      fetchAccessCodeRequirement(); // Fetch access code requirement status

      // Set up a refresh interval (e.g., every 30 seconds)
      const intervalId = setInterval(fetchUsersData, 30 * 1000);

      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, isLoading, userRole]);

  const handleCleanupStuckCodes = async () => {
    setCleanupLoading(true);
    setCleanupMessage(null);

    try {
      const response = await fetch("/api/admin/cleanup-stuck-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCleanupMessage(`✅ ${data.message}`);
        // Refresh the users data to show updated status
        window.location.reload();
      } else {
        setCleanupMessage(
          `❌ Error: ${data.message || "Failed to cleanup codes"}`
        );
      }
    } catch (error: any) {
      console.error("Error cleaning up stuck codes:", error);
      setCleanupMessage(
        `❌ Network error: ${error.message || "Unknown error"}`
      );
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleToggleAccessCodeRequirement = async () => {
    setToggleLoading(true);
    setToggleMessage(null);
    try {
      const response = await fetch("/api/admin/access-code-requirement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          required: !accessCodeRequired,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Toggle failed");
      }

      const result = await response.json();
      setAccessCodeRequired(!accessCodeRequired);
      setToggleMessage(result.message);

      // Update the cookie immediately for middleware access
      document.cookie = `accessCodeRequired=${!accessCodeRequired}; path=/; max-age=${
        60 * 60 * 24 * 365
      }; SameSite=Lax`;
    } catch (error: any) {
      console.error("Toggle error:", error);
      setToggleMessage(`❌ Error: ${error.message}`);
    } finally {
      setToggleLoading(false);
    }
  };

  // Global authentication check from useAuth
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-7xl mx-auto px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
        <p className="text-gray-300">Loading authentication...</p>
      </div>
    );
  }

  // Frontend RBAC: Check if authenticated AND if user has 'admin' role
  if (!isAuthenticated || userRole !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-7xl mx-auto px-4 text-white">
        <Ban size={80} className="text-red-500 mb-6 animate-pulse" />
        <h1 className="text-4xl font-extrabold text-red-400 mb-4">
          Access Denied
        </h1>
        <p className="text-lg text-gray-300 text-center">
          You do not have the necessary permissions to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-8 bg-gray-900 min-h-screen text-white">
      <div className="flex items-center gap-4 mb-10">
        <Users size={60} className="text-blue-400" />
        <h1 className="text-5xl font-extrabold text-blue-400 drop-shadow-lg">
          Access Code Status
        </h1>
      </div>

      <p className="text-lg text-gray-300 mb-8 text-center max-w-2xl">
        This dashboard shows the status of all active access codes, including
        current usage and recent activity.
      </p>

      {/* Cleanup Button and Information */}
      <div className="mb-6 flex flex-col items-center gap-4">
        <div className="text-center max-w-2xl">
          <h3 className="text-lg font-semibold text-yellow-300 mb-2">
            🧹 Stuck Codes Cleanup
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            This button cleans up access codes that remain marked as "in use"
            even when users are no longer active. This is a safety net for edge
            cases and ensures the database stays clean.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              <strong>Prevention:</strong> Heartbeat system, automatic cleanup,
              browser event handling
            </p>
            <p>
              <strong>When needed:</strong> Browser crashes, network failures,
              session timeouts, or when you want to force-clean the database
            </p>
            <p>
              <strong>Note:</strong> The display above automatically shows users
              as "logged out" after 1 hour, but this cleanup ensures the
              database reflects the actual status
            </p>
          </div>
        </div>

        <button
          onClick={handleCleanupStuckCodes}
          disabled={cleanupLoading}
          className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          {cleanupLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Cleaning Up...
            </>
          ) : (
            <>
              <AlertCircle size={16} />
              Clean Up Stuck Codes
            </>
          )}
        </button>
        {cleanupMessage && (
          <div
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              cleanupMessage.startsWith("✅")
                ? "bg-green-900/40 border border-green-700 text-green-300"
                : "bg-red-900/40 border border-red-700 text-red-300"
            }`}
          >
            {cleanupMessage}
            {cleanupMessage.startsWith("✅") && (
              <div className="mt-2 text-xs text-green-200">
                💡 The system now has active prevention measures to reduce stuck
                codes in the future.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Access Code Requirement Toggle */}
      <div className="mb-6 flex flex-col items-center gap-4">
        <div className="text-center max-w-2xl">
          <h3 className="text-lg font-semibold text-purple-300 mb-2">
            🔐 Access Code Requirement
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Control whether users need to enter access codes to use the system.
            When disabled, anyone can access the application without
            authentication.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              <strong>Current Status:</strong> Access codes are currently{" "}
              <span
                className={
                  accessCodeRequired ? "text-green-400" : "text-red-400"
                }
              >
                {accessCodeRequired ? "REQUIRED" : "NOT REQUIRED"}
              </span>
            </p>
            <p>
              <strong>Security Note:</strong> Disabling access codes removes all
              authentication barriers
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleAccessCodeRequirement}
          disabled={toggleLoading}
          className={`px-6 py-3 font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2 ${
            accessCodeRequired
              ? "bg-red-600 hover:bg-red-700 disabled:bg-gray-600"
              : "bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
          } text-white`}
        >
          {toggleLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Updating...
            </>
          ) : (
            <>
              {accessCodeRequired ? (
                <>
                  <Ban size={16} />
                  Disable Access Code Requirement
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Enable Access Code Requirement
                </>
              )}
            </>
          )}
        </button>
        {toggleMessage && (
          <div
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              toggleMessage.startsWith("✅")
                ? "bg-green-900/40 border border-green-700 text-green-300"
                : "bg-red-900/40 border border-red-700 text-red-300"
            }`}
          >
            {toggleMessage}
          </div>
        )}
      </div>

      {fetchLoading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-400 mb-3"></div>
          <p className="text-gray-400">Fetching access code data...</p>
        </div>
      ) : fetchError ? (
        <div className="bg-red-900/40 border border-red-700 text-red-300 px-6 py-4 rounded-lg text-base flex items-center justify-center animate-fade-in max-w-lg text-center">
          <AlertCircle size={24} className="mr-3" />
          <span>Error: {fetchError}</span>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center text-gray-400 text-xl py-10">
          No active access codes found.
        </div>
      ) : (
        <div className="w-full max-w-6xl bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tl-lg"
                >
                  Access Code ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Player ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Login Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Last Used
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tr-lg"
                >
                  Recently Active
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr
                  key={user.accessCodeId}
                  className="hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-300">
                    {user.accessCodeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                    {user.playerId || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.isActiveCode ? (
                      user.is_in_use ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
                          <Wifi size={14} className="mr-1" /> Currently Logged
                          In
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-900 text-purple-300">
                          <WifiOff size={14} className="mr-1" /> Available
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-900 text-red-300">
                        <Ban size={14} className="mr-1" /> Inactive Code
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {formatTime(user.lastUsed)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.isRecentlyActive ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300">
                        <Clock size={14} className="mr-1" /> Recent
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-600 text-gray-300">
                        <Clock size={14} className="mr-1" /> Old
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Status Legend */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
              <p className="text-xs text-blue-300">
                <strong>💡 Auto-Logout:</strong> Users are automatically
                considered "logged out" if they haven't been active for over 1
                hour, even if their session wasn't properly closed. This
                prevents stuck codes from showing incorrect status.
              </p>
            </div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              Status Legend:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
                  <Wifi size={12} className="mr-1" /> Currently Logged In
                </span>
                <span>
                  User has the page open and has been active within the last
                  hour
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-900 text-purple-300">
                  <WifiOff size={12} className="mr-1" /> Available
                </span>
                <span>
                  Access code is valid but user is inactive or logged out
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900 text-red-300">
                  <Ban size={12} className="mr-1" /> Inactive Code
                </span>
                <span>Access code has been deactivated or is invalid</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
