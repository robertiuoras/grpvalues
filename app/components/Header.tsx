"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
  ];

  return (
    <header className="bg-blue-950 text-gray-100 p-4 shadow-md sticky top-0 z-50 font-sans">
      <div className="container mx-auto flex items-center justify-between relative">
        {/* Left: Logo */}
        <Link
          href="/"
          className="text-3xl font-bold text-blue-400 hover:text-blue-300 transition-colors duration-300"
        >
          Grand RP Values
        </Link>

        {/* Center: Home button */}
        <Link
          href="/"
          className="absolute left-1/2 transform -translate-x-1/2 text-lg md:text-xl font-semibold px-5 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
          onClick={() => setIsDropdownOpen(false)} // close dropdown if open
        >
          Home
        </Link>

        {/* Right: Categories dropdown */}
        <div className="flex justify-end items-center relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-3 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold transition duration-200 flex items-center gap-2 shadow-sm text-sm md:text-base"
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
