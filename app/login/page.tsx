// app/login/page.tsx - Client-side login form for user authentication.
"use client";

import React, { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import Cookies from 'js-cookie';
import { useAuth } from '../../hooks/useAuth'; // Corrected path to useAuth

export default function LoginPage() {
  const [accessCode, setAccessCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log('LoginPage: Component rendered.');
  }, []);

  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted! Attempting to verify access code...'); // ADDED LOG
    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch('/api/verify-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessCode: accessCode.trim() }),
        cache: 'no-store', 
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store authentication in cookies
        Cookies.set('isAuthenticated', 'true', { expires: 1 });
        Cookies.set('authTimestamp', new Date().getTime().toString(), { expires: 1 });
        // Store the userRole from the API response
        Cookies.set('userRole', data.userRole, { expires: 1 }); 
        setError("");
        // Redirect to the home page or the page they were trying to access
        window.location.href = '/'; 
      } else {
        setError(data.message || "Invalid access code. Please try again.");
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError("Failed to verify access code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8 transform transition-all duration-300 scale-95 md:scale-100">
        <div className="text-center mb-8">
          <Lock size={60} className="text-blue-400 mx-auto mb-5 animate-bounce" />
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-wide">Secure Access</h1>
          <p className="text-gray-300 text-lg">
            Please enter your access code to proceed.
          </p>
        </div>

        <form onSubmit={handleAccessCodeSubmit} className="space-y-6">
          <div>
            <label htmlFor="accessCode" className="block text-sm font-medium text-gray-300 mb-2">
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
            Forgot your code or need assistance? Contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
