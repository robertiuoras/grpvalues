// app/page.tsx - This component renders the main content if the user is authenticated.
// It relies on the useAuth hook for authentication status and redirection.
"use client";

import {
  Car,
  Ship,
  Plane,
  Package,
  Glasses,
  // Removed Shirt, Scissors, Lock as they are not used directly in this version
} from "lucide-react";
import React from "react"; // Explicitly import React for JSX usage
import { useAuth } from '../../hooks/useAuth'; // Import useAuth hook

interface CategoryCard {
  name: string;
  path: string;
  description: string;
  icon: React.ReactNode;
}

export default function HomePage() {
  // Use the authentication hook to get global auth state
  const { isAuthenticated, isLoading } = useAuth(); 

  const categories: CategoryCard[] = [
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
      name: "Luminous Shirts",
      path: "/values/lumitshirt",
      description: "Check the values for luminous shirts.",
      icon: <Package size={40} className="text-yellow-400" />, // Changed to Package as Shirt/Scissors not imported
    },
    {
      name: "Luminous Pants",
      path: "/values/lumipants",
      description: "Find the values for luminous pants.",
      icon: <Package size={40} className="text-green-400" />, // Changed to Package as Shirt/Scissors not imported
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
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-5xl font-extrabold text-blue-400 mb-6 drop-shadow-lg text-center">
        Welcome to Grand RP Values
      </h1>
      <p className="text-xl text-gray-300 mb-12 text-center max-w-3xl">
        Select a category below to explore the current market values.
      </p>

      {/* Grid for category cards - responsive for 1, 2, or 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
        {categories.map((category) => (
          <a
            key={category.name}
            href={category.path}
            className="flex items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700
                                 hover:bg-gray-700 hover:shadow-2xl transition-all duration-300 cursor-pointer"
          >
            <div className="mr-4">{category.icon}</div>
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-white">{category.name}</h2>
              <p className="text-gray-300 text-sm">{category.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
