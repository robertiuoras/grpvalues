// app/login/page.tsx - Admin login page
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const [accessCode, setAccessCode] = useState("");
  const [state, setState] = useState({
    isVerifying: false,
    error: "",
  });
  const { login, isAdmin } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAdmin) {
      router.push("/admin/active-users");
    }
  }, [isAdmin, router]);

  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Client: Admin login form submitted!");
    setState({ isVerifying: true, error: "" });

    try {
      const result = await login(accessCode.trim());

      if (result.success) {
        console.log("Client: Admin login successful. Redirecting to admin panel.");
        router.push("/admin/active-users");
      } else {
        console.log("Client: Admin login failed:", result.message);
        setState({
          isVerifying: false,
          error: result.message || "Invalid admin code",
        });
      }
    } catch (error) {
      console.error("Client: Admin login error:", error);
      setState({
        isVerifying: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Enter your admin access code to manage GRP Database
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAccessCodeSubmit}>
          <div>
            <label htmlFor="accessCode" className="sr-only">
              Admin Access Code
            </label>
            <input
              id="accessCode"
              name="accessCode"
              type="text"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter admin access code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              disabled={state.isVerifying}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={state.isVerifying}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {state.isVerifying ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                "Sign in as Admin"
              )}
            </button>
          </div>

          {state.error && (
            <div className="rounded-lg bg-red-900/20 border border-red-500/30 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-400">
                    Authentication Failed
                  </h3>
                  <div className="mt-2 text-sm text-red-300">
                    <p>{state.error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Only admin access codes are accepted for this login.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}