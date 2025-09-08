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
  Globe,
  Activity,
  TrendingUp,
} from "lucide-react";

interface ActiveUser {
  accessCodeId: string;
  playerId: string | null;
  is_in_use: boolean;
  lastUsed: string | null;
  isRecentlyActive: boolean;
  isActiveCode: boolean;
}

interface VisitorStats {
  totalVisitors: number;
  uniqueIPs: number;
  onlineUsers: number;
  recentActivity: Array<{
    ip: string;
    timestamp: string;
    userAgent: string;
    page: string;
  }>;
  timeFilter: string;
  period: string;
}

interface Suggestion {
  id: string;
  suggestion: string;
  timestamp: string;
  clientIP: string;
  status: string;
  createdAt: string;
}

export default function ActiveUsersPage() {
  const { isAuthenticated, isLoading, userRole, isAdmin } = useAuth();
  const [users, setUsers] = useState<ActiveUser[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({
    totalVisitors: 0,
    uniqueIPs: 0,
    onlineUsers: 0,
    recentActivity: [],
    timeFilter: 'all',
    period: 'All Time',
  });
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [timeFilter, setTimeFilter] = useState<'all' | 'daily' | 'weekly'>('all');
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
  const fetchActiveUsers = React.useCallback(async () => {
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
  }, []);

  // Fetch visitor statistics
  const fetchVisitorStats = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/visitor-stats?filter=${timeFilter}`);
      if (response.ok) {
        const data = await response.json();
        setVisitorStats(data);
      }
    } catch (error) {
      console.error("Error fetching visitor stats:", error);
    }
  }, [timeFilter]);

  // Fetch suggestions
  const fetchSuggestions = React.useCallback(async () => {
    try {
      const response = await fetch("/api/suggestions");
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }, []);

  // Cleanup stuck codes
  const handleCleanup = React.useCallback(async () => {
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
  }, [fetchActiveUsers]);

  // Sync templates
  const handleSyncTemplates = React.useCallback(async () => {
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
  }, []);

  // Fetch last sync time
  const fetchLastSyncTime = React.useCallback(async () => {
    try {
      const response = await fetch("/api/last-sync");
      if (response.ok) {
        const data = await response.json();
        setLastSyncTime(data.lastSyncTime);
      }
    } catch (error) {
      console.error("Error fetching last sync time:", error);
    }
  }, []);

  useEffect(() => {
    fetchActiveUsers();
    fetchVisitorStats();
    fetchLastSyncTime();
    fetchSuggestions();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchActiveUsers();
      fetchVisitorStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchActiveUsers, fetchVisitorStats, fetchLastSyncTime, fetchSuggestions]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

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

        {/* Time Filter Controls */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="text-blue-400" />
            Time Filter
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter('daily')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeFilter === 'daily'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeFilter('weekly')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeFilter === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              This Week
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Currently showing: <span className="text-blue-400 font-medium">{visitorStats.period}</span>
          </p>
        </div>

        {/* Visitor Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total Visitors</p>
                <p className="text-3xl font-bold">{visitorStats.totalVisitors}</p>
              </div>
              <Globe className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium">Unique IPs</p>
                <p className="text-3xl font-bold">{visitorStats.uniqueIPs}</p>
              </div>
              <Activity className="w-8 h-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Online Users</p>
                <p className="text-3xl font-bold">{visitorStats.onlineUsers}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm font-medium">Active Sessions</p>
                <p className="text-3xl font-bold">{users.filter(user => user.is_in_use).length}</p>
              </div>
              <Users className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="text-green-400" />
            Recent Activity
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {visitorStats.recentActivity.length > 0 ? (
              visitorStats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div>
                      <p className="text-white text-sm font-medium">{activity.ip}</p>
                      <p className="text-gray-400 text-xs">{activity.page}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-300 text-xs">{formatTime(activity.timestamp)}</p>
                    <p className="text-gray-500 text-xs truncate max-w-32">{activity.userAgent}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No recent activity</p>
            )}
          </div>
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

        {/* Suggestions Section */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="text-yellow-400" />
            User Suggestions ({suggestions.length})
          </h2>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        suggestion.status === 'pending' 
                          ? 'bg-yellow-600 text-yellow-100' 
                          : suggestion.status === 'approved'
                          ? 'bg-green-600 text-green-100'
                          : 'bg-red-600 text-red-100'
                      }`}>
                        {suggestion.status}
                      </span>
                      <span className="text-gray-400 text-sm">{suggestion.clientIP}</span>
                    </div>
                    <span className="text-gray-400 text-sm">
                      {formatTime(suggestion.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {suggestion.suggestion}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No suggestions submitted yet</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}