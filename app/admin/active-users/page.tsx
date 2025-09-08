// app/admin/active-users/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  Users,
  AlertCircle,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Database,
} from "lucide-react";

interface ActiveUser {
  accessCodeId: string;
  playerId: string | null;
  is_in_use: boolean;
  lastUsed: string | null;
  isRecentlyActive: boolean;
  isActiveCode: boolean;
}

export default function ActiveUsersPage() {
  const { isAuthenticated, isLoading, userRole, isAdmin } = useAuth();
  const [users, setUsers] = useState<ActiveUser[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);

  // Sync-related state variables
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>("");
  const [syncProgress, setSyncProgress] = useState<{
    current: number;
    total: number;
  }>({ current: 0, total: 0 });

  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-300">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  // Helper function to format time properly
  const formatTime = (timeString: string | null) => {
    if (!timeString || timeString === "Never") return "Never";

    try {
      let date: Date;
      if (/^\d+$/.test(timeString)) {
        date = new Date(parseInt(timeString));
      } else {
        date = new Date(timeString);
      }

      if (isNaN(date.getTime())) return timeString;

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

  // Fetch active users
  const fetchActiveUsers = async () => {
    setFetchLoading(true);
    setFetchError(null);

    try {
      const response = await fetch("/api/get-active-users");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching active users:", error);
      setFetchError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setFetchLoading(false);
    }
  };

  // Cleanup stuck codes
  const handleCleanup = async () => {
    setCleanupLoading(true);
    setCleanupMessage(null);

    try {
      const response = await fetch("/api/admin/cleanup-stuck-codes", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setCleanupMessage(data.message || "Cleanup completed successfully");
      
      // Refresh the user list
      await fetchActiveUsers();
    } catch (error) {
      console.error("Error during cleanup:", error);
      setCleanupMessage(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setCleanupLoading(false);
    }
  };

  // Sync templates
  const handleSyncTemplates = async () => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncStatus("Starting sync...");
    setSyncProgress({ current: 0, total: 0 });

    try {
      const response = await fetch("/api/sync-templates", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSyncStatus(data.message || "Sync completed successfully");
      setLastSyncTime(new Date().toISOString());
    } catch (error) {
      console.error("Error during sync:", error);
      setSyncError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch last sync time
  const fetchLastSyncTime = async () => {
    try {
      const response = await fetch("/api/last-sync");
      if (response.ok) {
        const data = await response.json();
        setLastSyncTime(data.lastSyncTime);
      }
    } catch (error) {
      console.error("Error fetching last sync time:", error);
    }
  };

  useEffect(() => {
    fetchActiveUsers();
    fetchLastSyncTime();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Admin Panel
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Manage GRP Database administration and monitor system status
          </p>
        </div>

        {/* Sync Templates Section */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Database className="text-blue-400" />
            Template Sync
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <button
                onClick={handleSyncTemplates}
                disabled={isSyncing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {isSyncing ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
                {isSyncing ? "Syncing..." : "Sync Templates"}
              </button>
            </div>
            
            <div className="text-gray-300">
              <p className="text-sm">
                <strong>Last Sync:</strong> {lastSyncTime ? formatTime(lastSyncTime) : "Never"}
              </p>
              {syncStatus && (
                <p className="text-sm text-green-400 mt-1">{syncStatus}</p>
              )}
              {syncError && (
                <p className="text-sm text-red-400 mt-1">{syncError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Active Users Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="text-green-400" />
              System Status
            </h2>
            <div className="flex gap-2">
              <button
                onClick={fetchActiveUsers}
                disabled={fetchLoading}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${fetchLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={handleCleanup}
                disabled={cleanupLoading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                {cleanupLoading ? "Cleaning..." : "Cleanup"}
              </button>
            </div>
          </div>

          {fetchLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading system status...</p>
            </div>
          ) : fetchError ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 mb-2">Error loading system status</p>
              <p className="text-gray-300 text-sm">{fetchError}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {users.filter(user => user.is_in_use).length}
                  </div>
                  <div className="text-sm text-gray-300">Active Sessions</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {users.filter(user => user.isRecentlyActive).length}
                  </div>
                  <div className="text-sm text-gray-300">Recently Active</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {users.length}
                  </div>
                  <div className="text-sm text-gray-300">Total Codes</div>
                </div>
              </div>

              {cleanupMessage && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
                  <p className="text-green-400 text-sm">{cleanupMessage}</p>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                    <tr>
                      <th className="px-6 py-3">Code ID</th>
                      <th className="px-6 py-3">Player ID</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Last Used</th>
                      <th className="px-6 py-3">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.accessCodeId} className="bg-gray-800 border-b border-gray-700">
                        <td className="px-6 py-4 font-mono text-xs">
                          {user.accessCodeId}
                        </td>
                        <td className="px-6 py-4">
                          {user.playerId || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {user.is_in_use ? (
                              <>
                                <Wifi className="w-4 h-4 text-green-400" />
                                <span className="text-green-400">Online</span>
                              </>
                            ) : (
                              <>
                                <WifiOff className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-400">Offline</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {formatTime(user.lastUsed)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {user.isActiveCode ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-green-400">Active</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-red-400" />
                                <span className="text-red-400">Inactive</span>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}