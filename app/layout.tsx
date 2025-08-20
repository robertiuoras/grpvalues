// app/layout.tsx - This file is a Server Component responsible for defining metadata and
// rendering the main client-side layout.

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientLayoutWrapper from "./ClientLayoutWrapper"; // FIX: Import the renamed client component

const inter = Inter({ subsets: ["latin"] });

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
    // Render the client-side layout component, passing children and font class
    <ClientLayoutWrapper fontClassName={inter.className}>
      {children}
    </ClientLayoutWrapper>
  );
}
