"use client";

import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { MapPin, Clock, DollarSign, Search, Compass } from "lucide-react";

export default function TreasureHelperPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-7xl mx-auto px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mb-4"></div>
        <p className="text-gray-300">Loading treasure guide...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-900 to-orange-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter">
      <main className="max-w-6xl mx-auto bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 sm:p-12 lg:p-14 border border-amber-100 text-center relative overflow-hidden">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-amber-800 leading-tight mb-8 drop-shadow-md relative z-10 flex items-center justify-center gap-4">
          <span role="img" aria-label="treasure">
            📦
          </span>
          Treasure Helper
          <span role="img" aria-label="map">
            🗺️
          </span>
        </h1>

        <div className="mb-8 relative z-10">
          <p className="text-xl text-amber-700 mb-8 max-w-3xl mx-auto">
            Master the art of treasure hunting in Grand RP! Learn how to find,
            craft, and maximize your treasure earnings.
          </p>

          {/* New Feature Notice */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 border-2 border-purple-300 shadow-lg mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-2xl">🚀</span>
              <h3 className="text-2xl font-bold text-white">Coming Soon!</h3>
              <span className="text-2xl">🚀</span>
            </div>
            <p className="text-white text-lg font-medium">
              New Feature will be added soon
            </p>
            <p className="text-purple-100 text-sm mt-2">
              This page will help you analyze treasure maps and find exact
              locations
            </p>
          </div>
        </div>

        {/* Treasure Guide Content */}
        <div className="relative z-10 text-left max-w-5xl mx-auto space-y-8">
          {/* Treasure Location Finder */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
            <h2 className="text-2xl font-bold text-emerald-800 mb-4 flex items-center justify-center gap-2">
              🗺️ Treasure Location Finder
            </h2>
            <p className="text-emerald-700 text-center mb-6">
              Upload or paste a screenshot of your treasure map to get help
              finding the location!
            </p>

            <div className="max-w-2xl mx-auto text-center">
              <p className="text-emerald-700 text-lg">
                Treasure map analysis tools will be available soon!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
