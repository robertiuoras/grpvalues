// app/admin/active-users/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth'; // Adjust path as needed
import { Users, AlertCircle, Ban } from 'lucide-react'; // Added Ban icon

interface ActiveUser {
  playerId: string;
  lastActivity: string;
  accessCodeId: string;
}

export default function ActiveUsersPage() {
  const { isAuthenticated, isLoading, userRole } = useAuth(); // Destructure userRole
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if authenticated AND user is an admin AND not already loading
    if (isAuthenticated && userRole === 'admin' && !isLoading) {
      const fetchActiveUsers = async () => {
        setFetchLoading(true);
        setFetchError(null);
        try {
          const response = await fetch('/api/get-active-users');
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
          }
          const data = await response.json();
          
          console.log('API Response Data:', data); 
          
          if (data.success) {
            console.log('Active users received:', data.activeUsers); 
            setActiveUsers(data.activeUsers);
          } else {
            setFetchError(data.message || 'Failed to fetch active users.');
            console.error('API reported failure:', data.message); 
          }
        } catch (error: any) {
          console.error('Error fetching active users from client:', error); 
          setFetchError(`Could not load active users: ${error.message || 'Unknown error'}`);
        } finally {
          setFetchLoading(false);
        }
      };

      fetchActiveUsers(); // Initial fetch

      // Set up a refresh interval (e.g., every 30 seconds)
      const intervalId = setInterval(fetchActiveUsers, 30 * 1000); 

      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, isLoading, userRole]); // Re-run effect if auth status or role changes

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
  if (!isAuthenticated || userRole !== 'admin') {
    // useAuth will redirect to /login if not authenticated.
    // If authenticated but not admin, show access denied.
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-7xl mx-auto px-4 text-white">
        <Ban size={80} className="text-red-500 mb-6 animate-pulse" />
        <h1 className="text-4xl font-extrabold text-red-400 mb-4">Access Denied</h1>
        <p className="text-lg text-gray-300 text-center">
          You do not have the necessary permissions to view this page.
        </p>
      </div>
    );
  }

  // If we reach here, the user is authenticated AND has the 'admin' role
  return (
    <div className="flex flex-col items-center p-8 bg-gray-900 min-h-screen text-white">
      <div className="flex items-center gap-4 mb-10">
        <Users size={60} className="text-blue-400" />
        <h1 className="text-5xl font-extrabold text-blue-400 drop-shadow-lg">Active Users</h1>
      </div>

      <p className="text-lg text-gray-300 mb-8 text-center max-w-2xl">
        This dashboard shows access codes that have been used within the last hour and are currently active.
      </p>

      {fetchLoading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-400 mb-3"></div>
          <p className="text-gray-400">Fetching active user data...</p>
        </div>
      ) : fetchError ? (
        <div className="bg-red-900/40 border border-red-700 text-red-300 px-6 py-4 rounded-lg text-base flex items-center justify-center animate-fade-in max-w-lg text-center">
          <AlertCircle size={24} className="mr-3" />
          <span>Error: {fetchError}</span>
        </div>
      ) : activeUsers.length === 0 ? (
        <div className="text-center text-gray-400 text-xl py-10">
          No active users found at this moment.
        </div>
      ) : (
        <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6">
          <ul className="space-y-4">
            {activeUsers.map((user) => (
              <li key={user.accessCodeId} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-700 p-4 rounded-lg border border-gray-600 shadow-sm">
                <div className="mb-2 sm:mb-0">
                  <p className="text-blue-300 font-bold text-lg">Player ID: <span className="text-white">{user.playerId}</span></p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Last Activity: <span className="font-medium text-gray-100">{user.lastActivity}</span></p>
                  <p className="text-gray-400 text-xs">Access Code ID: <span className="font-mono text-gray-300">{user.accessCodeId}</span></p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
