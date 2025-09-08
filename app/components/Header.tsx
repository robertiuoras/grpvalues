"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import Cookies from "js-cookie";

export function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin } = useAuth();

  const categories = [
    { name: "Cars", path: "/values/cars", isAdmin: false },
    { name: "Boats", path: "/values/boats", isAdmin: false },
    { name: "Planes", path: "/values/planes", isAdmin: false },
    { name: "Helicopters", path: "/values/helicopters", isAdmin: false },
    { name: "Motorcycles", path: "/values/motorcycles", isAdmin: false },
    { name: "Clothing List", path: "/values/clothinglist", isAdmin: false },
    { name: "Masks", path: "/values/masks", isAdmin: false },
    {
      name: "Luminous Clothing",
      path: "/values/luminousclothing",
      isAdmin: false,
    },
    { name: "Battlepass", path: "/battlepass", isAdmin: false },
    { name: "Bunker Help", path: "/bunker-help", isAdmin: false },
    { name: "Pet Timer", path: "/pet-timer", isAdmin: false },
    { name: "Illegal Items", path: "/values/illegalitems", isAdmin: false },
    {
      name: "Cropped Collection Shirts",
      path: "/values/croppcollectionshirt",
      isAdmin: false,
    },
    { name: "Denim Jackets", path: "/values/denimjacket", isAdmin: false },
    { name: "Items", path: "/values/items", isAdmin: false },
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

  const handleLogout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    console.log("Client: Admin logout clicked, clearing cookies and redirecting.");

    // Clear all authentication cookies
    Cookies.remove("isAuthenticated");
    Cookies.remove("authTimestamp");
    Cookies.remove("userRole");
    Cookies.remove("userId");

    // Redirect to home page
    router.push("/");
  };


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
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200 hover:scale-105 transform shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
          </div>

          {/* Right side - Navigation and Admin Auth */}
          <div className="flex items-center space-x-4">
            {/* Categories Dropdown - Bigger and nicer */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
                <div className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-xl shadow-xl border border-gray-700 z-50 max-h-96 overflow-y-auto">
                  <div className="py-2">
                    {getCategoriesWithAdmin().map((category) => (
                      <Link
                        key={category.name}
                        href={category.path}
                        onClick={() => setIsDropdownOpen(false)}
                        className={`block px-4 py-3 text-sm transition-colors duration-200 hover:bg-gray-700 ${
                          category.isAdmin
                            ? "text-yellow-400 font-semibold border-b border-gray-600 mb-1"
                            : "text-gray-300 hover:text-white"
                        }`}
                      >
                        {category.isAdmin && "🔧 "}
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Logout - Only show for authenticated admins */}
            {isAdmin && (
              <Link
                href="#"
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors duration-200"
              >
                Log Out
              </Link>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}