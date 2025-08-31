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

            <div className="max-w-2xl mx-auto">
              {/* File Upload */}
              <div className="mb-6">
                <label
                  htmlFor="treasure-image"
                  className="block text-sm font-medium text-emerald-700 mb-2"
                >
                  📁 Upload Treasure Map Image
                </label>
                <input
                  id="treasure-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Handle file upload logic here
                      console.log("File selected:", file.name);
                    }
                  }}
                  className="block w-full text-sm text-emerald-700 border border-emerald-300 rounded-lg cursor-pointer bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Paste from Clipboard */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-emerald-700 mb-2">
                  📋 Paste from Clipboard
                </label>
                <button
                  onClick={async () => {
                    try {
                      const clipboardItems = await navigator.clipboard.read();
                      for (const clipboardItem of clipboardItems) {
                        for (const type of clipboardItem.types) {
                          if (type.startsWith("image/")) {
                            const blob = await clipboardItem.getType(type);
                            // Handle clipboard image logic here
                            console.log("Image pasted from clipboard");
                            break;
                          }
                        }
                      }
                    } catch (err) {
                      console.log("Failed to read clipboard:", err);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  📋 Paste Image from Clipboard
                </button>
              </div>

              {/* Drag & Drop Zone */}
              <div
                className="border-2 border-dashed border-emerald-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors duration-200 cursor-pointer"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add(
                    "border-emerald-500",
                    "bg-emerald-50"
                  );
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove(
                    "border-emerald-500",
                    "bg-emerald-50"
                  );
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove(
                    "border-emerald-500",
                    "bg-emerald-50"
                  );
                  const files = e.dataTransfer.files;
                  if (files.length > 0 && files[0].type.startsWith("image/")) {
                    // Handle dropped image file here
                    console.log("Image dropped:", files[0].name);
                  }
                }}
                onClick={() =>
                  document.getElementById("treasure-image")?.click()
                }
              >
                <div className="text-emerald-600">
                  <svg
                    className="mx-auto h-12 w-12 mb-4"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-lg font-medium">
                    Drag & Drop your treasure map image here
                  </p>
                  <p className="text-sm text-emerald-500 mt-2">
                    or click to browse files
                  </p>
                </div>
              </div>

              {/* Analysis Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    // Handle image analysis logic here
                    console.log("Analyzing treasure map...");
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg text-lg"
                >
                  🔍 Analyze Treasure Map
                </button>
              </div>

              {/* Results Display */}
              <div className="mt-6 p-4 bg-white bg-opacity-50 rounded-lg border border-emerald-200">
                <h3 className="text-lg font-semibold text-emerald-800 mb-2">
                  📍 Location Results
                </h3>
                <p className="text-emerald-700 text-sm">
                  Upload or paste your treasure map image above to get location
                  coordinates and directions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
