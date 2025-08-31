// app/ClientLayoutWrapper.tsx - Client Component handling the actual visual layout and client-side features.
// This file was previously named app/layout.tsx, but has been renamed to resolve naming conflicts.
"use client";

import React from "react";
import { Inter } from "next/font/google"; // Import Inter again if you need its class here directly
import "./globals.css"; // Ensure your global styles are imported
import { Header } from "./components/Header"; // FIX: Changed to a named import for Header
import { SpeedInsights } from "@vercel/speed-insights/next"; // Import SpeedInsights
import { Analytics } from "@vercel/analytics/react"; // Import Analytics
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

// This component is no longer the default export of app/layout.tsx,
// but a named export (or default export from a renamed file)
export default function ClientLayoutWrapper({
  children,
  fontClassName, // Prop to receive font class from server layout
}: Readonly<{
  children: React.ReactNode;
  fontClassName?: string;
}>) {
  useEffect(() => {
    console.log("🔍 Vercel Analytics Debug: Component mounted");
    console.log("🔍 Vercel Analytics Debug: Check browser console for analytics events");
  }, []);
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <div
          className={`${
            fontClassName || inter.className
          } bg-gray-900 text-white min-h-screen flex flex-col`}
        >
          <Header />
          {children}
        </div>
        <SpeedInsights />
        <Analytics 
          debug={true}
          mode="production"
        />
      </body>
    </html>
  );
}
