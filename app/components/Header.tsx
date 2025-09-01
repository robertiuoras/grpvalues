"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import Cookies from "js-cookie"; // Import js-cookie to remove client-side cookies

export function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, userRole } = useAuth();

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
    { name: "Treasure Helper", path: "/treasure-helper", isAdmin: false },
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

  const adminLinks = [
    { name: "Admin Panel", path: "/admin/active-users" },
    { name: "Improvements", path: "/improvements" },
  ];

  // Create categories with admin button for admin users
  const getCategoriesWithAdmin = () => {
    if (userRole === "admin") {
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
    setIsDropdownOpen(false);
    console.log("Client: Initiating logout process...");
    try {
      // Step 1: Call the server-side logout API
      const response = await fetch("/api/logout", {
        method: "GET",
        redirect: "follow",
      });
      console.log(
        `Client: Logout API response status: ${response.status}, redirected: ${response.redirected}`
      );

      // Step 2: Also remove client-side cookies set by js-cookie,
      // as server-side deletion might miss them due to domain/path nuances on Vercel.
      Cookies.remove("isAuthenticated", { path: "/" });
      Cookies.remove("authTimestamp", { path: "/" });
      Cookies.remove("userRole", { path: "/" });
      Cookies.remove("userId", { path: "/" }); // Ensure userId is also removed client-side
      // Removed: localStorage.removeItem("lastAccessCode"); // This line was causing the popup not to show
      console.log("Client: Cleared client-side cookies.");

      // If the server successfully redirected (response.redirected is true)
      // or if the final response after redirect was OK (response.ok is true for 2xx status)
      if (response.redirected || response.ok) {
        console.log(
          "Client: Server logout process successful. Redirecting to /login."
        );
        // Use router.replace to ensure the browser history is clean and user can't go back to authenticated page
        router.replace("/login");
      } else {
        const errorText = await response.text();
        console.error(
          "Client: Logout API failed, no redirect or non-ok status:",
          errorText
        );
        alert("Logout failed. Please try again. (Server error)");
        router.replace("/login"); // Force redirect to login even on apparent server failure
      }
    } catch (error) {
      console.error("Client: Error during logout fetch:", error);
      alert(
        "An error occurred during logout. Please check your network and try again. (Network error)"
      );
      router.replace("/login"); // Force redirect to login on client-side fetch error
    }
  };

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-blue-950 text-gray-100 p-4 shadow-md sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between relative px-8">
        <div className="flex items-center gap-4">
          <Link
            href="#"
            onClick={handleLogout}
            className="text-sm md:text-base font-medium px-3 py-1 rounded-full bg-red-600/80 text-white hover:bg-red-700 transition-colors duration-300 whitespace-nowrap"
          >
            Log Out
          </Link>
          {renderHomeLink(
            "Grand RP Values",
            "text-3xl font-bold text-blue-400 hover:text-blue-300 transition-colors duration-300"
          )}
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          {renderHomeLink(
            "Home",
            "text-lg md:text-xl font-semibold px-5 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 whitespace-nowrap"
          )}
        </div>

        <div className="flex-shrink-0 relative flex items-center gap-4">
          <Link
            href="/events/school"
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition duration-200 shadow-sm text-sm md:text-base whitespace-nowrap"
            onClick={() => setIsDropdownOpen(false)}
          >
            School Event
          </Link>

          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold transition duration-200 flex items-center gap-2 shadow-sm text-sm md:text-base"
          >
            <span>{userRole === "admin" ? "Admin" : "Categories"}</span>{" "}
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
            <div className="absolute right-0 top-14 mt-2 py-2 w-56 bg-blue-900 rounded-lg shadow-xl border border-blue-700 z-50 max-h-96 overflow-y-auto">
              {getCategoriesWithAdmin().map((category) => (
                <Link
                  key={category.name}
                  href={category.path}
                  className={`block px-4 py-2 text-sm md:text-base transition-colors duration-300 ${
                    category.isAdmin
                      ? "text-red-300 hover:bg-red-700 hover:text-white"
                      : "text-gray-100 hover:bg-blue-700 hover:text-white"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsDropdownOpen(false);
                    // Small delay to ensure dropdown closes before navigation
                    setTimeout(() => {
                      router.push(category.path);
                    }, 100);
                  }}
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
