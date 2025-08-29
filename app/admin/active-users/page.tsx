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

      fetchUsersData(); // Initial fetch

      // Set up a refresh interval (e.g., every 30 seconds)
      const intervalId = setInterval(fetchUsersData, 30 * 1000);

      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, isLoading, userRole]);

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
                  Status
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
                          <Wifi size={14} className="mr-1" /> In Use
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
                    {user.lastUsed}
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
        </div>
      )}
    </div>
  );
}
