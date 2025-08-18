// app/layout.tsx
"use client"; // This directive marks the component as a Client Component.
// It's necessary for using React Hooks like useState.

// IMPORTANT: In this environment, Next.js specific imports like 'next/head', 'next/link',
// and 'next/navigation' (including usePathname) do not resolve directly.
// We are adjusting the code to use standard HTML elements and client-side React state
// to ensure it runs correctly within the Canvas.
// Global CSS imports like "./globals.css" are also not directly supported;
// Tailwind CSS is loaded via CDN in the outer environment.

// FIX: Attempting '../components/Header' again, as this is the standard relative path
// if 'app' and 'components' are sibling directories at the project root.
// If this continues to fail, the issue is likely with the project's file structure
// or build environment's path resolution.
import Header from "../components/Header"; // Import the Header component
import { useState } from "react"; // For dropdown menu state, still needed if RootLayout has other state

// Define the root layout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Removed isDropdownOpen and categories state as they will be handled by the Header component.
  // Kept useState import for now in case other state is added later.

  return (
    <html lang="en">
      <head>
        {/* Inter font for consistency. Tailwind CSS CDN is assumed to be handled in the outer environment. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Manually adding a <title> tag as 'next/head' is not resolvable here. */}
        <title>Grand RP Values</title>
        {/* Tailwind CSS CDN - Ensure this is present in your actual Next.js project's root layout or global CSS */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 font-sans">
        {/* Render the Header component directly */}
        <Header />

        {/* This is where your page content (children) will be rendered */}
        {/* FIX: Simplified className for main to match server-rendered output, preventing hydration error. */}
        <main className="flex-grow w-full px-4 max-w-7xl mx-auto">
          {children}
        </main>

        <footer className="text-sm text-gray-500 mt-8 text-center w-full py-4">
          Data synced daily from Google Sheets.
        </footer>
      </body>
    </html>
  );
}
