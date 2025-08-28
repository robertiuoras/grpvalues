"use client";

import React, { useState } from "react";
import Link from "next/link"; // Re-enabled Link import
import { usePathname } from "next/navigation"; // Import usePathname

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname(); // Get current pathname

  const categories = [
    { name: "Cars", path: "/values/cars" },
    { name: "Boats", path: "/values/boats" },
    { name: "Planes", path: "/values/planes" },
    { name: "Helicopters", path: "/values/helicopters" },
    { name: "Clothing List", path: "/values/clothinglist" },
    { name: "Masks", path: "/values/masks" },
    { name: "Luminous Shirts", path: "/values/lumitshirt" },
    { name: "Luminous Pants", path: "/values/lumipants" },
    { name: "Motorcycles", path: "/values/motorcycles" },
    { name: "Bunker Help", path: "/values/bunkerhelp" },
    { name: "Illegal Items", path: "/values/illegalitems" },
    { name: "Cropped Collection Shirts", path: "/values/croppcollectionshirt" },
    { name: "Denim Jackets", path: "/values/denimjacket" },
    { name: "Items", path: "/values/items" },
    { name: "LifeInvader", path: "/lifeinvader" }
  ];

  // Helper to render a link that prevents navigation if already on the same page
  const renderHomeLink = (content: React.ReactNode, className: string) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (pathname === '/') {
        e.preventDefault(); // Prevent default navigation if already on the homepage
      }
      setIsDropdownOpen(false); // Close dropdown on click, even if not navigating
    };

    return (
      <Link href="/" className={className} onClick={handleClick}>
        {content}
      </Link>
    );
  };

  return (
    <header className="bg-blue-950 text-gray-100 p-4 shadow-md sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between relative px-8">
        {/* Left: Logo - Now uses renderHomeLink */}
        <div className="flex-shrink-0 min-w-fit">
          {renderHomeLink(
            "Grand RP Values",
            "text-3xl font-bold text-blue-400 hover:text-blue-300 transition-colors duration-300"
          )}
        </div>

        {/* Center: Home button - Now uses renderHomeLink */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          {renderHomeLink(
            "Home",
            "text-lg md:text-xl font-semibold px-5 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 whitespace-nowrap"
          )}
        </div>

        {/* Right: Categories dropdown */}
        <div className="flex-shrink-0 relative min-w-fit">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold transition duration-200 flex items-center gap-2 shadow-sm text-sm md:text-base"
          >
            <span>Categories</span>
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
              {categories.map((category) => (
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
