// app/page.tsx - This component renders the main content if the user is authenticated.
// It relies on the useAuth hook for authentication status and redirection.
"use client";

import {
  Car,
  Ship,
  Plane,
  Package,
  Glasses,
  Shirt, // Re-added Shirt icon for Luminous Clothing
  HelpCircle, // Add HelpCircle icon for Beginner Help
} from "lucide-react";
import React, { useState, useEffect } from "react"; // Explicitly import React for JSX usage
import { useAuth } from "../hooks/useAuth"; // Import useAuth hook - FIXED PATH
import Link from "next/link"; // Add Next.js Link import
import { useRouter } from "next/navigation"; // Add router for navigation
import Cookies from "js-cookie"; // Import Cookies for reading accessCodeRequired

interface CategoryCard {
  name: string;
  path: string;
  description: string;
  icon: React.ReactNode;
}

export default function HomePage() {
  const router = useRouter(); // Add router instance
  
  // Check if access codes are required immediately (client-side only)
  const accessCodeRequired = typeof window !== 'undefined' ? Cookies.get("accessCodeRequired") : null;
  const codesNotRequired = accessCodeRequired === "false";
  
  // Only use useAuth hook if access codes are required
  const { isAuthenticated, isLoading } = useAuth();
  
  const categories: CategoryCard[] = [
    {
      name: "Beginner Help",
      path: "/beginner-help",
      description: "Get started with Grand RP and learn the basics.",
      icon: <HelpCircle size={40} className="text-red-400" />,
    },
    {
      name: "Cars",
      path: "/values/cars",
      description: "Find market values for all types of cars.",
      icon: <Car size={40} className="text-blue-400" />,
    },
    {
      name: "Boats",
      path: "/values/boats",
      description: "Check values for various boats and yachts.",
      icon: <Ship size={40} className="text-teal-400" />,
    },
    {
      name: "Planes",
      path: "/values/planes",
      description: "Discover the prices of private planes.",
      icon: <Plane size={40} className="text-emerald-400" />,
    },
    {
      name: "Helicopters",
      path: "/values/helicopters",
      description: "Browse values for different helicopter models.",
      icon: <Plane size={40} className="text-purple-400 rotate-90" />,
    },
    {
      name: "Clothing List",
      path: "/values/clothinglist",
      description: "Explore the market values for various clothing items.",
      icon: <Package size={40} className="text-pink-400" />,
    },
    {
      name: "Masks",
      path: "/values/masks",
      description: "Browse different types of masks.",
      icon: <Glasses size={40} className="text-orange-400" />,
    },
    {
      name: "Luminous Clothing",
      path: "/values/luminousclothing",
      description: "Check values for luminous shirts and pants.",
      icon: <Shirt size={40} className="text-yellow-400" />,
    },
  ];
  
  // If access codes are not required, render the page immediately
  if (codesNotRequired) {
    console.log("Page: Access codes not required, rendering content without authentication");
    // Render the page content directly
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-7xl mx-auto px-4">
        {/* Main content goes here */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Welcome to Grand RP Values
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
            Your ultimate resource for accurate market values of vehicles, clothing, and items in Grand RP. 
            Get real-time pricing data to make informed trading decisions.
          </p>
        </div>

        {/* Community-Driven Platform Section */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-white/10 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6 text-white">
            Community-Driven Platform
          </h2>
          <p className="text-lg text-gray-300 text-center mb-6">
            Our platform is built by the community, for the community. Every value, every update, 
            and every improvement comes from players like you who want to make trading fair and transparent.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-xl font-semibold text-blue-400 mb-2">Real-Time Data</h3>
              <p className="text-gray-300">Values updated continuously based on actual market activity</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-xl font-semibold text-purple-400 mb-2">Community Verified</h3>
              <p className="text-gray-300">All values are verified by experienced traders and community members</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-xl font-semibold text-pink-400 mb-2">Always Free</h3>
              <p className="text-gray-300">No paywalls, no premium features - everything is free for everyone</p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12 w-full max-w-6xl">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              href={category.path}
              className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors duration-300">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* How to Join Button */}
        <div className="relative group">
          <a
            href="https://gta5grand.com/?ref=160825"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-bold text-sm md:text-base block w-full h-full"
          >
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            How to Join?
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>

        {/* Tip Section */}
        <div className="mt-12 p-6 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 backdrop-blur-sm rounded-xl border border-yellow-500/20 max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Tip</h3>
              <p className="text-gray-300">
                Found an outdated value or have a suggestion? Contact robthemaster on discord to help improve the platform for everyone!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Override loading state if access codes are not required
  const shouldShowLoading = codesNotRequired ? false : isLoading;



  // Show a loading state while authentication is being checked by useAuth
  // But only if access codes are required
  if (shouldShowLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-7xl mx-auto px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
        <p className="text-gray-300">Loading content...</p>
      </div>
    );
  }


  
  // If access codes are required and user is not authenticated, show loading
  if (!codesNotRequired && !isAuthenticated) {
    // If useAuth determines the user is NOT authenticated, it will handle the redirect to /login.
    // So, if we reach this point and isAuthenticated is false, it means a redirect is
    // in progress or has just completed, so we render nothing to avoid flickering.
    return null;
  }
  
  // If access codes are not required, render the page regardless of authentication status
  if (codesNotRequired) {
    console.log("Page: Access codes not required, rendering content without authentication");
  }

  // If authenticated, render the actual home page content
  return (
    <>
      {/* How to Join Notification - Fixed position outside layout */}
      <div className="fixed top-24 left-4 z-50 pointer-events-none">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full shadow-lg border-2 border-green-400 transition-all duration-300 cursor-pointer group pointer-events-auto hover:scale-105">
          <a
            href="https://gta5grand.com/?ref=160825"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-bold text-sm md:text-base block w-full h-full"
          >
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            How to Join?
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>

      <div className="flex flex-col items-center w-full max-w-7xl mx-auto px-4 py-8 relative">
        <h1 className="text-5xl font-extrabold text-blue-400 mb-6 drop-shadow-lg text-center">
          Welcome to Grand RP Values
        </h1>
        <p className="text-xl text-gray-300 mb-8 text-center max-w-3xl">
          Select a category below to explore the current market values.
        </p>

        {/* Community Information Section */}
        <div className="mb-12 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-700/30 max-w-4xl">
          <h2 className="text-2xl font-bold text-blue-300 mb-4 text-center">
            🌟 Community-Driven Platform
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-green-300 mb-2">
                🤝 Built by Players, for Players
              </h3>
              <p className="text-sm leading-relaxed">
                This platform is maintained and updated by the Grand RP
                community. All values, templates, and features are contributed
                by active players who understand the market dynamics and
                community needs.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                📊 Real-Time Market Data
              </h3>
              <p className="text-sm leading-relaxed">
                Get accurate, up-to-date market values for vehicles, clothing,
                and items. Our community ensures the data reflects current
                market conditions and helps you make informed trading decisions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-2">
                🎯 AI-Powered Assistance
              </h3>
              <p className="text-sm leading-relaxed">
                Our advanced AI assistant learns from community feedback to
                provide better ad formatting and suggestions. Every correction
                helps improve the system for everyone.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-300 mb-2">
                🔄 Continuous Improvement
              </h3>
              <p className="text-sm leading-relaxed">
                The platform evolves based on community feedback and needs. New
                features, categories, and improvements are regularly added to
                enhance your experience.
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-800/20 rounded-lg border border-blue-600/30">
            <p className="text-center text-sm text-blue-200">
              <strong>💡 Tip:</strong> Found an outdated value or have a
              suggestion? Contact robthemaster on discord to help improve the
              platform for everyone!
            </p>
          </div>
        </div>

        {/* Grid for category cards - responsive for 1, 2, or 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.path}
              onClick={(e) => {
                e.preventDefault();
                // Small delay to ensure smooth navigation
                setTimeout(() => {
                  router.push(category.path);
                }, 100);
              }}
              className="flex items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700
                                 hover:bg-gray-700 hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="mr-4">{category.icon}</div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-white">
                  {category.name}
                </h2>
                <p className="text-gray-300 text-sm">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
