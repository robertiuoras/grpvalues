// app/components/Header.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../hooks/useAuth"; // Corrected import path for useAuth hook

export function Header() {
  // This must be a named export to match ClientLayoutWrapper's import
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, isLoading, userRole } = useAuth(); // Get auth state and userRole

  const categories = [
    { name: "Cars", path: "/values/cars" },
    { name: "Boats", path: "/values/boats" },
    { name: "Planes", path: "/values/planes" },
    { name: "Helicopters", path: "/values/helicopters" },
    { name: "Clothing List", path: "/values/clothinglist" },
    { name: "Masks", path: "/values/masks" },
    { name: "Luminous Clothing", path: "/values/luminousclothing" }, // Merged Luminous Shirts and Pants
    { name: "Motorcycles", path: "/values/motorcycles" },
    { name: "Bunker Help", path: "/values/bunkerhelp" },
    { name: "Illegal Items", path: "/values/illegalitems" },
    { name: "Cropped Collection Shirts", path: "/values/croppcollectionshirt" },
    { name: "Denim Jackets", path: "/values/denimjacket" },
    { name: "Items", path: "/values/items" },
    { name: "LifeInvader", path: "/lifeinvader" },
  ];

  const adminLinks = [
    { name: "Admin Panel", path: "/admin/active-users" }, // Example admin link
    // Add other admin-specific links here
  ];

  const renderHomeLink = (content: React.ReactNode, className: string) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (pathname === "/") {
        e.preventDefault();
      }
      setIsDropdownOpen(false);
    };

    return (
      <Link href="/" className={className} onClick={handleClick}>
        {content}
      </Link>
    );
  };

  // Only render header if authenticated (or still loading to avoid flicker)
  // If not authenticated, useAuth will handle redirect, so header might not be needed anyway.
  if (isLoading) {
    return null; // Or a simple loading spinner if you want something to show
  }

  // If not authenticated and no longer loading, header should not render
  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-blue-950 text-gray-100 p-4 shadow-md sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between relative px-8">
        {/* Left: Log Out button and Logo */}
        <div className="flex items-center gap-4">
          {/* Log Out Button */}
          <Link
            href="/logout"
            className="text-sm md:text-base font-medium px-3 py-1 rounded-full bg-red-600/80 text-white hover:bg-red-700 transition-colors duration-300 whitespace-nowrap"
            onClick={() => setIsDropdownOpen(false)}
          >
            Log Out
          </Link>
          {renderHomeLink(
            "Grand RP Values",
            "text-3xl font-bold text-blue-400 hover:text-blue-300 transition-colors duration-300"
          )}
        </div>

        {/* Center: Home button */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          {renderHomeLink(
            "Home",
            "text-lg md:text-xl font-semibold px-5 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 whitespace-nowrap"
          )}
        </div>

        {/* Right: School Event button and Categories/Admin dropdown */}
        <div className="flex-shrink-0 relative flex items-center gap-4">
          {/* New School Event Button */}
          <Link
            href="/events/school"
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition duration-200 shadow-sm text-sm md:text-base whitespace-nowrap"
            onClick={() => setIsDropdownOpen(false)}
          >
            School Event
          </Link>

          {/* Categories/Admin Dropdown */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold transition duration-200 flex items-center gap-2 shadow-sm text-sm md:text-base"
          >
            <span>{userRole === "owner" ? "Admin" : "Categories"}</span>{" "}
            {/* Dynamic button text */}
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 top-14 mt-2 py-2 w-56 bg-blue-900 rounded-lg shadow-xl border border-blue-700 z-50">
              {userRole === "owner" // Show admin links if owner
                ? adminLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.path}
                      className="block px-4 py-2 text-sm md:text-base text-gray-100 hover:bg-blue-700 hover:text-white transition-colors duration-300"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))
                : // Otherwise show categories
                  categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.path}
                      className="block px-4 py-2 text-sm md:text-base text-gray-100 hover:bg-blue-700 hover:text-white transition-colors duration-300"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
