// app/login/page.tsx - Client-side login form for user authentication.
"use client";

import React, { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [accessCode, setAccessCode] = useState("");
  const [state, setState] = useState({ isVerifying: false, error: "" });
  const [showRememberCodePopup, setShowRememberCodePopup] = useState(false);
  const [lastUsedCode, setLastUsedCode] = useState<string | null>(null);

  const { isVerifying, error } = state;

  useEffect(() => {
    // Check for a previously saved code in localStorage on component mount
    const savedCode = localStorage.getItem("lastAccessCode");
    if (savedCode) {
      setLastUsedCode(savedCode);
      setShowRememberCodePopup(true);
    }
  }, []);

  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Client: Form submitted! Verifying..."); // ADDED LOG
    setState({ isVerifying: true, error: "" });

    try {
      const response = await fetch("/api/verify-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: accessCode.trim() }),
        cache: "no-store",
      });

      console.log("Client: Fetch response received. Status:", response.status); // ADDED LOG
      const data = await response.json();
      console.log("Client: Response data:", data); // ADDED LOG

      if (response.ok && data.success) {
        console.log(
          "Client: Login successful. Setting cookies and redirecting."
        ); // ADDED LOG
        // Store authentication in cookies and the last used code in localStorage
        Cookies.set("isAuthenticated", "true", { expires: 1 });
        Cookies.set("authTimestamp", new Date().getTime().toString(), {
          expires: 1,
        });
        Cookies.set("userRole", data.userRole, { expires: 1 });
        localStorage.setItem("lastAccessCode", accessCode.trim()); // Save the code for future visits
        window.location.href = "/";
      } else {
        console.log(
          "Client: In else block (server error or data.success false)."
        ); // ADDED LOG
        // Server responded with an error or data.success was false
        setState((prevState) => ({
          ...prevState,
          error: data.message || "Invalid access code. Please try again.",
        }));
      }
    } catch (err) {
      console.error("Client: Verification error in catch block:", err); // ADDED LOG
      // Network error or unexpected client-side error
      setState((prevState) => ({
        ...prevState,
        error: "Failed to verify access code. Please try again.",
      }));
    } finally {
      console.log("Client: Finally block executed. isVerifying set to false."); // ADDED LOG
      // Ensure isVerifying is always set to false, regardless of success or failure
      setState((prevState) => ({ ...prevState, isVerifying: false }));
    }
  };

  const useLastCode = () => {
    if (lastUsedCode) {
      setAccessCode(lastUsedCode);
      setShowRememberCodePopup(false);
    }
  };

  const dismissPopup = () => {
    setShowRememberCodePopup(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-900 text-white p-4 relative">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8 transform transition-all duration-300 scale-95 md:scale-100">
        <div className="text-center mb-8">
          <Lock
            size={60}
            className="text-blue-400 mx-auto mb-5 animate-bounce"
          />
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-wide">
            Early Access
          </h1>
          <p className="text-gray-300 text-lg">
            Please enter your access code to proceed.
          </p>
        </div>

        <form onSubmit={handleAccessCodeSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="accessCode"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Access Code
            </label>
            <input
              id="accessCode"
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Enter your secret code..."
              className="w-full px-5 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
              required
              disabled={isVerifying}
            />
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 px-5 py-3 rounded-lg text-base flex items-center justify-center animate-fade-in">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying || !accessCode.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-3 focus:ring-blue-500"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Verifying Access...
              </>
            ) : (
              "Unlock Content"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Forgot your code or need assistance? Contact robthemaster on
            Discord.
          </p>
        </div>
      </div>

      {/* Popup to use last code */}
      {showRememberCodePopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 max-w-sm w-full text-center space-y-4 transform transition-all duration-300 scale-95 md:scale-100">
            <h2 className="text-xl font-bold text-white">Use Previous Code?</h2>
            <p className="text-gray-300">
              Would you like to use your last used access code?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={useLastCode}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Yes
              </button>
              <button
                onClick={dismissPopup}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
