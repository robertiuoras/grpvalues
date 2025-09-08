"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";

export function HeaderFinal() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { isAdmin, logout } = useAuth();

  console.log('HeaderFinal component rendered, isDropdownOpen:', isDropdownOpen, 'isAdmin:', isAdmin);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const categories = [
    { name: "Items", path: "/values/items", isAdmin: false },
    { name: "Cars", path: "/values/cars", isAdmin: false },
    { name: "Boats", path: "/values/boats", isAdmin: false },
    { name: "Planes", path: "/values/planes", isAdmin: false },
    { name: "Helicopters", path: "/values/helicopters", isAdmin: false },
    { name: "Motorcycles", path: "/values/motorcycles", isAdmin: false },
    { name: "Clothing List", path: "/values/clothinglist?gender=men&heading=accessory", isAdmin: false },
    { name: "Masks", path: "/values/masks", isAdmin: false },
    {
      name: "Luminous Clothing",
      path: "/values/luminousclothing?type=shirts",
      isAdmin: false,
    },
    { name: "Illegal Items", path: "/values/illegalitems", isAdmin: false },
    {
      name: "Cropped Collection Shirts",
      path: "/values/croppcollectionshirt",
      isAdmin: false,
    },
    { name: "Denim Jackets", path: "/values/denimjacket", isAdmin: false },
    { name: "Battlepass", path: "/battlepass", isAdmin: false },
    { name: "Bunker Help", path: "/bunker-help", isAdmin: false },
    { name: "Pet Timer", path: "/pet-timer", isAdmin: false },
    { name: "LifeInvader", path: "/lifeinvader", isAdmin: false },
    { name: "Suggestions", path: "/suggestions", isAdmin: false },
  ];

  // Create categories with admin button for admin users
  const getCategoriesWithAdmin = () => {
    if (isAdmin) {
      return [
        { name: "Admin Panel", path: "/admin/active-users", isAdmin: true },
        { name: "Improvements", path: "/improvements", isAdmin: true },
        ...categories,
      ];
    }
    return categories;
  };

  // Helper function to render home link
  const renderHomeLink = (text: string, className: string) => (
    <Link href="/" className={className}>
      {text}
    </Link>
  );

  return (
    <header className="bg-gray-900 shadow-lg border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo/Home link */}
          <div className="flex items-center">
            {renderHomeLink(
              "GRP Database",
              "text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors duration-300"
            )}
          </div>

          {/* Center - Home Button - Better centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="/"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 transform shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </Link>
          </div>

          {/* Right side - Navigation and Admin Auth */}
          <div className="flex items-center space-x-4">
            {/* Categories Dropdown - Bigger and nicer */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  console.log('Categories button clicked, current state:', isDropdownOpen);
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 hover:scale-105 transform shadow-lg"
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

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-red-600 border-4 border-yellow-400 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto custom-scrollbar">
                  <div className="py-3">
                    <div className="px-5 py-2 text-white bg-yellow-500 text-lg font-bold mb-2">
                      🚨 DROPDOWN WORKING! Categories: {getCategoriesWithAdmin().length}
                    </div>
                    
                    {getCategoriesWithAdmin().map((category, index) => {
                      return (
                        <Link
                          key={category.name}
                          href={category.path}
                          onClick={() => setIsDropdownOpen(false)}
                          className={`group flex items-center px-5 py-3 text-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 hover:scale-[1.02] ${
                            category.isAdmin
                              ? "text-yellow-400 font-semibold border-b border-gray-600/50 mb-2 pb-3 hover:text-yellow-300"
                              : "text-gray-200 hover:text-white"
                          } ${index === 0 && category.isAdmin ? 'mt-0' : ''}`}
                        >
                          <span className="flex-1 font-medium tracking-wide">
                            {category.isAdmin && "🔧 "}
                            {category.name}
                          </span>
                          <svg
                            className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Logout Button */}
            {isAdmin && (
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200 hover:scale-105 transform shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
