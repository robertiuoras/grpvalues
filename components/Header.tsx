// components/Header.tsx
"use client";

import { useState } from "react";

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const categories = [
    { name: "Cars", path: "/values/cars" },
    { name: "Boats", path: "/values/boats" },
    { name: "Planes", path: "/values/planes" },
    { name: "Helicopters", path: "/values/helicopters" },
    { name: "Clothing List", path: "/values/clothinglist" },
    { name: "Masks", path: "/values/masks" },
  ];

  return (
    <header className="bg-gray-800 shadow-lg py-4 px-6 mb-8 sticky top-0 w-full z-50 overflow-visible">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left aligned: Logo/Site Title */}
        <div className="flex-1 flex justify-start">
          <a
            href="/"
            className="text-3xl font-extrabold text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            Grand RP Values
          </a>
        </div>
        {/* Centered: Home button - Added flex-1 and justify-center */}
        <div className="flex-1 flex justify-center">
          <a
            href="/home"
            // Added bg-gray-700 for default background and enhanced hover/animation
            className="text-lg font-semibold px-4 py-2 rounded-lg bg-gray-700 transition-all duration-300 text-gray-200 hover:bg-gray-600 hover:scale-105 transform"
            onClick={() => setIsDropdownOpen(false)}
          >
            Home
          </a>
        </div>
        {/* Right aligned: Categories dropdown - Added flex-1 */}
        <div className="flex-1 flex justify-end relative z-50">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
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
            <div className="absolute top-full mt-2 right-0 w-48 bg-gray-700 rounded-lg shadow-xl py-1 z-50">
              {categories.map((category) => (
                <a
                  key={category.name}
                  href={category.path}
                  className="block px-4 py-2 text-sm hover:bg-gray-600 text-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  {category.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
