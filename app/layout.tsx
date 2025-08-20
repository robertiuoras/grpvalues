// app/layout.tsx - Layout with Vercel Speed Insights integration.
"use client"; // This component will be a client component because SpeedInsights is a client component

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Ensure your global styles are imported
import Header from './components/Header'; // Import your Header component
import { SpeedInsights } from "@vercel/speed-insights/next"; // Import SpeedInsights

const inter = Inter({ subsets: ["latin"] });

// Metadata can still be defined, but it might be overridden by client-side metadata
export const metadata: Metadata = {
  title: "Grand RP Values",
  description: "Market values for Grand RP items, vehicles, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Added suppressHydrationWarning to the html tag
    <html lang="en" suppressHydrationWarning> 
      <body>
        {/* Apply classes to an inner div instead. This might help with hydration mismatches 
            caused by browser extensions injecting attributes directly into <body>. */}
        <div className={`${inter.className} bg-gray-900 text-white min-h-screen flex flex-col`}>
          <Header />
          {children} {/* This renders the content of your current page (e.g., HomePage or LoginPage) */}
        </div>
        <SpeedInsights /> {/* Render the SpeedInsights component here */}
      </body>
    </html>
  );
}
