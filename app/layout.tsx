import "./globals.css"; // Tailwind and global styles
import Header from "./components/Header";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Grand RP Values",
  description: "Market values synced daily from Google Sheets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-900 text-gray-100 font-sans"
    >
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow w-full px-4 max-w-7xl mx-auto">
          {children}
        </main>
        <footer className="text-sm text-gray-400 mt-8 text-center w-full py-4">
          Data synced daily from Google Sheets.
        </footer>
        <Analytics /> {/* <- Add this here */}
      </body>
    </html>
  );
}
