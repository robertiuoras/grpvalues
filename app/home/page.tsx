// app/page.tsx
"use client";

import {
  Car,
  Ship,
  Plane,
  Package,
  Glasses,
  Shirt,
  Scissors,
  Lock,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie'; // You'll need to install this: npm install js-cookie

interface CategoryCard {
  name: string;
  path: string;
  description: string;
  icon: React.ReactNode;
}

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const checkAuthentication = () => {
      const authStatus = Cookies.get('isAuthenticated');
      const authTimestamp = Cookies.get('authTimestamp');

      if (authStatus === 'true' && authTimestamp) {
        const now = new Date().getTime();
        const authTime = parseInt(authTimestamp);
        const hoursSinceAuth = (now - authTime) / (1000 * 60 * 60);

        // Session expires after 24 hours
        if (hoursSinceAuth < 24) {
          setIsAuthenticated(true);
        } else {
          // Clear expired session
          Cookies.remove('isAuthenticated');
          Cookies.remove('authTimestamp');
        }
      }
      setIsLoading(false);
    };

    checkAuthentication();
  }, []);

  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch('/api/verify-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessCode: accessCode.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        // Store authentication in cookies
        Cookies.set('isAuthenticated', 'true', { expires: 1 }); // Expires in 1 day
        Cookies.set('authTimestamp', new Date().getTime().toString(), { expires: 1 });
        setError("");
      } else {
        setError(data.message || "Invalid access code. Please try again.");
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError("Failed to verify access code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAccessCode("");
    Cookies.remove('isAuthenticated');
    Cookies.remove('authTimestamp');
  };

  const categories: CategoryCard[] = [
    // ... your categories remain the same
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
      description:
        "Browse values for Desert Scarf, Bandana, Tight, and Snowboarder masks.",
      icon: <Glasses size={40} className="text-orange-400" />,
    },
    {
      name: "Luminous Shirts",
      path: "/values/lumitshirt",
      description: "Check the values for luminous shirts.",
      icon: <Shirt size={40} className="text-yellow-400" />,
    },
    {
      name: "Luminous Pants",
      path: "/values/lumipants",
      description: "Find the values for luminous pants.",
      icon: <Scissors size={40} className="text-green-400" />,
    },
    {
      name: "Items",
      path: "/values/items",
      description: "Explore miscellaneous items and their values.",
      icon: <Package size={40} className="text-indigo-400" />,
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-7xl mx-auto px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
        <p className="text-gray-300">Loading...</p>
      </div>
    );
  }

  // Access code form
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-md mx-auto px-4">
        <div className="w-full bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8">
          <div className="text-center mb-6">
            <Lock size={48} className="text-blue-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Access Required</h1>
            <p className="text-gray-300">
              Please enter your access code to view Grand RP Values
            </p>
          </div>

          <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-gray-300 mb-2">
                Access Code
              </label>
              <input
                id="accessCode"
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter your access code (e.g., ABC-DEF-12)"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                required
                disabled={isVerifying}
              />
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !accessCode.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                "Access Site"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Don't have an access code? Contact your administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main content (authenticated users)
  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto px-4 py-8">
      <div className="w-full flex justify-between items-center mb-8">
        <h1 className="text-5xl font-extrabold text-blue-400 drop-shadow-lg">
          Welcome to Grand RP Values
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-300 text-sm"
        >
          Logout
        </button>
      </div>

      <p className="text-xl text-gray-300 mb-12 text-center max-w-3xl">
        Select a category below to explore the current market values.
      </p>

      {/* Equal-height cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
        {categories.map((category) => (
          <a
            key={category.name}
            href={category.path}
            className="flex flex-col p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700
                         hover:bg-gray-700 hover:shadow-2xl transition-all duration-300 cursor-pointer
                         h-full"
          >
            <div className="flex items-center mb-4">
              <div className="mr-4">{category.icon}</div>
              <h2 className="text-2xl font-bold text-white">{category.name}</h2>
            </div>
            <p className="text-gray-300 text-sm flex-grow">
              {category.description}
            </p>
            <div className="mt-4">
              <span className="text-blue-400 font-semibold">View →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}