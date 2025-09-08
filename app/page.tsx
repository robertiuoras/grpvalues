// app/page.tsx - This component renders the main content for the public site.
"use client";

import {
  Car,
  Ship,
  Plane,
  Package,
  Glasses,
  Shirt, // Re-added Shirt icon for Luminous Clothing
  HelpCircle, // Add HelpCircle icon for Beginner Help
  Shield, // Add Shield icon for Admin Login
} from "lucide-react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

interface CategoryCard {
  name: string;
  path: string;
  description: string;
  icon: React.ReactNode;
}

export default function HomePage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(true);

  // Ensure this only runs on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-close popup after 10 seconds
  useEffect(() => {
    if (isClient) {
      const timer = setTimeout(() => {
        setShowUpdatePopup(false);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [isClient]);

  const categories: CategoryCard[] = [
    {
      name: "Beginner Help",
      path: "/beginner-help",
      description: "Get started with GRP Database and learn the basics.",
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

      {/* Update Popup - Top Left, under How to Join button */}
      {isClient && showUpdatePopup && (
        <div className="fixed top-32 left-4 z-50 max-w-sm">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl shadow-2xl border border-blue-400/50 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <h3 className="font-bold text-sm">New Update!</h3>
                </div>
                     <p className="text-xs text-blue-100 leading-relaxed">
                       🎉 <strong>Public Access Added!</strong> GRP Database is now fully public - no access codes required!
                     </p>
              </div>
              <button
                onClick={() => setShowUpdatePopup(false)}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
                aria-label="Close popup"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center w-full max-w-7xl mx-auto px-4 py-8 relative">
        <h1 className="text-5xl font-extrabold text-blue-400 mb-6 drop-shadow-lg text-center">
          Welcome to GRP Database
        </h1>
        <p className="text-xl text-gray-300 mb-2 text-center max-w-3xl">
          This is an unofficial database to aid players who play GTA RP.
        </p>
        <p className="text-sm text-gray-400 mb-8 text-center max-w-3xl">
          <strong>GRP Database is NOT</strong> official or affiliated with the developers of the game.
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
                This platform is maintained and updated by the GRP Database
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full mb-12">
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

        {/* Admin Login Section - Always show on client side */}
        {isClient && (
          <div className="w-full max-w-2xl">
            <div className={`rounded-xl p-6 border ${
              isAdmin 
                ? "bg-gradient-to-r from-green-800 to-green-700 border-green-600" 
                : "bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600"
            }`}>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Shield className={`w-6 h-6 ${isAdmin ? "text-green-400" : "text-yellow-400"}`} />
                  <h3 className="text-xl font-bold text-white">
                    {isAdmin ? "Admin Access" : "Admin Access"}
                  </h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  {isAdmin 
                    ? "You are currently logged in as an administrator. Access the admin panel to manage the database and system settings."
                    : "Are you an administrator? Access the admin panel to manage the database and system settings."
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  <Link
                    href="/login"
                    className={`inline-flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-colors duration-200 hover:scale-105 transform ${
                      isAdmin 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "bg-yellow-600 hover:bg-yellow-700 text-white"
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                    {isAdmin ? "Admin Panel" : "Admin Login"}
                  </Link>
                  {isAdmin && (
                    <button
                      onClick={() => window.location.href = '/admin/active-users'}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 hover:scale-105 transform"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Admin Panel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}