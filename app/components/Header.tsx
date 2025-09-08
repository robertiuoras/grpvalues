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
  const { isAuthenticated, isLoading, userRole, isAdmin } = useAuth();

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
              "text-3xl font-bold text-blue-400 hover:text-blue-300 transition-colors duration-300"
            )}
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2">
            {renderHomeLink(
              "GRP Database",
              "text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors duration-300"
            )}
          </div>

          {/* Right side - Navigation and Admin Auth */}
          <div className="flex items-center space-x-4">
            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
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
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-50 max-h-96 overflow-y-auto">
                  <div className="py-1">
                    {getCategoriesWithAdmin().map((category) => (
                      <Link
                        key={category.name}
                        href={category.path}
                        onClick={() => setIsDropdownOpen(false)}
                        className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                          category.isAdmin
                            ? "text-yellow-400 hover:bg-gray-700 font-semibold"
                            : "text-gray-300 hover:text-white hover:bg-gray-700"
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

            {/* Admin Panel Link - Always show for admins */}
            {isAdmin && (
              <Link
                href="/admin/active-users"
                className="px-3 py-2 rounded-md text-sm font-medium text-yellow-400 hover:text-yellow-300 hover:bg-gray-700 transition-colors duration-200"
              >
                🔧 Admin
              </Link>
            )}

            {/* Admin Logout - Only show for authenticated admins */}
            {isAdmin && (
              <Link
                href="#"
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors duration-200"
              >
                Log Out
              </Link>
            )}

            {/* Admin Login - Only show for non-authenticated users */}
            {!isAdmin && (
              <Link
                href="/login"
                className="px-3 py-2 rounded-md text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-gray-700 transition-colors duration-200"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}