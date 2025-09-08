"use client";

import React, { useState } from "react";
import { MessageSquare, Send, CheckCircle, AlertCircle } from "lucide-react";

export default function SuggestionsPage() {
  const [suggestion, setSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          suggestion: suggestion.trim(),
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Thank you for your suggestion! We'll review it and consider implementing it.",
        });
        setSuggestion("");
      } else {
        throw new Error("Failed to submit suggestion");
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Failed to submit suggestion. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Suggestions
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Help us improve GRP Database by sharing your ideas and feedback
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Suggestion Form */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <MessageSquare className="text-blue-400" />
              Share Your Idea
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="suggestion"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Your Suggestion
                </label>
                <textarea
                  id="suggestion"
                  name="suggestion"
                  rows={8}
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe your suggestion, improvement idea, or feedback here..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !suggestion.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Suggestion
                  </>
                )}
              </button>
            </form>

            {/* Status Message */}
            {submitStatus.type && (
              <div
                className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
                  submitStatus.type === "success"
                    ? "bg-green-900/20 border border-green-500/30 text-green-400"
                    : "bg-red-900/20 border border-red-500/30 text-red-400"
                }`}
              >
                {submitStatus.type === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm">{submitStatus.message}</span>
              </div>
            )}
          </div>

          {/* Information Panel */}
          <div className="space-y-6">
            {/* What We're Looking For */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">
                What We're Looking For
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>New features or improvements to existing ones</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Bug reports or issues you've encountered</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>UI/UX improvements or design suggestions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>New categories or data you'd like to see</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Performance improvements or optimizations</span>
                </li>
              </ul>
            </div>

            {/* Guidelines */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">
                Guidelines
              </h3>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>Be specific and detailed in your suggestions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>Explain why your suggestion would be beneficial</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>Be respectful and constructive in your feedback</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>Check if similar suggestions already exist</span>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-700/30">
              <h3 className="text-xl font-bold text-white mb-4">
                Other Ways to Reach Us
              </h3>
              <div className="space-y-3 text-gray-300">
                <p className="text-sm">
                  <strong>Discord:</strong> Contact robthemaster for direct communication
                </p>
                <p className="text-sm">
                  <strong>Response Time:</strong> We typically review suggestions within 1-2 weeks
                </p>
                <p className="text-sm">
                  <strong>Implementation:</strong> Approved suggestions are prioritized based on community impact and feasibility
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
