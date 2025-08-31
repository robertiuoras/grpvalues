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
import React from "react"; // Explicitly import React for JSX usage
import { useAuth } from "../hooks/useAuth"; // Import useAuth hook - FIXED PATH
import Link from "next/link"; // Add Next.js Link import
import { useRouter } from "next/navigation"; // Add router for navigation

interface CategoryCard {
  name: string;
  path: string;
  description: string;
  icon: React.ReactNode;
}

export default function HomePage() {
  // Use the authentication hook to get global auth state
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter(); // Add router instance

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
      name: "Luminous Clothing", // NEW: Merged category name
      path: "/values/luminousclothing", // NEW: Path to the merged page
      description: "Check values for luminous shirts and pants.", // NEW: Updated description
      icon: <Shirt size={40} className="text-yellow-400" />, // NEW: Using Shirt icon
    },
    {
      name: "Items",
      path: "/values/items",
      description: "Explore miscellaneous items and their values.",
      icon: <Package size={40} className="text-indigo-400" />,
    },
  ];

  // Show a loading state while authentication is being checked by useAuth
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-7xl mx-auto px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
        <p className="text-gray-300">Loading content...</p>
      </div>
    );
  }

  // If useAuth determines the user is NOT authenticated, it will handle the redirect to /login.
  // So, if we reach this point and isAuthenticated is false, it means a redirect is
  // in progress or has just completed, so we render nothing to avoid flickering.
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render the actual home page content
  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto px-4 py-8 relative">
      {/* How to Join Notification */}
      <div className="absolute top-20 left-4 z-50 pointer-events-none">
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

      <h1 className="text-5xl font-extrabold text-blue-400 mb-6 drop-shadow-lg text-center">
        Welcome to Grand RP Values
      </h1>
      <p className="text-xl text-gray-300 mb-12 text-center max-w-3xl">
        Select a category below to explore the current market values.
      </p>

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
              <h2 className="text-2xl font-bold text-white">{category.name}</h2>
              <p className="text-gray-300 text-sm">{category.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
