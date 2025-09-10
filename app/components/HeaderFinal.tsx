"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../lib/languageContext";

export function HeaderFinal() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { isAdmin, logout } = useAuth();
  const { t } = useLanguage();

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const categories = [
    { name: t("categories.items"), path: "/values/items", isAdmin: false },
    { name: t("categories.cars"), path: "/values/cars", isAdmin: false },
    { name: t("categories.boats"), path: "/values/boats", isAdmin: false },
    { name: t("categories.planes"), path: "/values/planes", isAdmin: false },
    {
      name: t("categories.helicopters"),
      path: "/values/helicopters",
      isAdmin: false,
    },
    {
      name: t("categories.motorcycles"),
      path: "/values/motorcycles",
      isAdmin: false,
    },
    {
      name: t("categories.clothing_list"),
      path: "/values/clothinglist?gender=men&heading=accessory",
      isAdmin: false,
    },
    { name: t("categories.masks"), path: "/values/masks", isAdmin: false },
    {
      name: t("categories.luminous_clothing"),
      path: "/values/luminousclothing?type=shirts",
      isAdmin: false,
    },
    {
      name: t("categories.illegal_items"),
      path: "/values/illegalitems",
      isAdmin: false,
    },
    {
      name: t("categories.cropped_collection_shirts"),
      path: "/values/croppcollectionshirt",
      isAdmin: false,
    },
    {
      name: t("categories.denim_jackets"),
      path: "/values/denimjacket",
      isAdmin: false,
    },
    { name: t("page_titles.battlepass"), path: "/battlepass", isAdmin: false },
    {
      name: t("page_titles.bunker_help"),
      path: "/bunker-help",
      isAdmin: false,
    },
    { name: t("page_titles.pet_timer"), path: "/pet-timer", isAdmin: false },
    {
      name: t("page_titles.lifeinvader"),
      path: "/lifeinvader",
      isAdmin: false,
    },
    {
      name: t("page_titles.suggestions"),
      path: "/suggestions",
      isAdmin: false,
    },
    { name: t("events.school.title"), path: "/events/school", isAdmin: false },
  ];

  // Create categories with admin button for admin users
  const getCategoriesWithAdmin = () => {
    if (isAdmin) {
      return [
        {
          name: t("page_titles.admin_panel"),
          path: "/admin/active-users",
          isAdmin: true,
        },
        {
          name: t("page_titles.improvements"),
          path: "/improvements",
          isAdmin: true,
        },
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
    <header className="bg-gray-900 shadow-lg border-b border-gray-700 sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo/Home link */}
          <div className="flex items-center">
            {renderHomeLink(
              "GRP Database",
              "text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors duration-300"
            )}
          </div>

          {/* Center - Home Button */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="/"
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>{t("navigation.home")}</span>
            </Link>
          </div>

          {/* Right side - Navigation and Admin Auth */}
          <div className="flex items-center space-x-4">
            {/* School Event Button */}
            <Link
              href="/events/school"
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              <span className="hidden sm:inline">
                {t("events.school.title")}
              </span>
              <span className="sm:hidden">School</span>
            </Link>

            {/* Categories Dropdown - Bigger and nicer */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
              >
                <span>{t("navigation.categories")}</span>
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

              {/* Dropdown Menu - Fixed positioning for visibility */}
              {isDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      zIndex: 99998,
                    }}
                    onClick={() => setIsDropdownOpen(false)}
                  />

                  {/* Dropdown */}
                  <div
                    style={{
                      position: "fixed",
                      top: "80px",
                      right: "20px",
                      width: "320px",
                      backgroundColor: "#1f2937",
                      borderRadius: "12px",
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                      border: "2px solid #6b7280",
                      maxHeight: "400px",
                      overflowY: "auto",
                      zIndex: 99999,
                    }}
                  >
                    <div className="py-3">
                      {getCategoriesWithAdmin().map((category, index) => {
                        return (
                          <Link
                            key={category.name}
                            href={category.path}
                            onClick={() => setIsDropdownOpen(false)}
                            className={`flex items-center px-5 py-3 text-sm hover:bg-gray-700/50 ${
                              category.isAdmin
                                ? "text-yellow-400 font-semibold border-b border-gray-600/50 mb-2 pb-3 hover:text-yellow-300"
                                : "text-gray-200 hover:text-white"
                            } ${index === 0 && category.isAdmin ? "mt-0" : ""}`}
                          >
                            <span className="flex-1 font-medium tracking-wide">
                              {category.isAdmin && "🔧 "}
                              {category.name}
                            </span>
                            <svg
                              className="w-4 h-4 opacity-0 hover:opacity-100 text-blue-400 transition-opacity duration-200"
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
                </>
              )}
            </div>

            {/* Admin Logout Button */}
            {isAdmin && (
              <button
                onClick={logout}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>{t("navigation.logout")}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
