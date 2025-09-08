"use client";

import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  Factory,
  Users,
  TrendingUp,
  Settings,
  Zap,
  Shield,
  Target,
  BarChart3,
  Lightbulb,
  Clock,
  DollarSign,
  ArrowRight,
} from "lucide-react";

export default function BunkerHelpPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-7xl mx-auto px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
        <p className="text-gray-300">Loading bunker operations...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <Factory className="w-5 h-5" />,
    },
    { id: "workers", label: "Workers", icon: <Users className="w-5 h-5" /> },
    {
      id: "production",
      label: "Production",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      id: "optimization",
      label: "Optimization",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Header */}
        <div className="text-center pt-20 pb-16 px-4">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-8 shadow-2xl animate-pulse">
            <Factory className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl sm:text-7xl font-black text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Bunker Operations
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Master the art of industrial warfare. Optimize your bunker, manage
            workers, and dominate the production chain in GRP Database.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-12 px-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
            <div className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-4 pb-20">
          <div className="max-w-7xl mx-auto">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Cards */}
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-8 h-8 text-blue-400" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Worker Management
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Efficiently assign and manage your bunker workforce for
                    maximum productivity.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-8 h-8 text-purple-400" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Production Lines
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Optimize your manufacturing processes and maximize output
                    efficiency.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-pink-500/20 to-red-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Target className="w-8 h-8 text-pink-400" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Strategic Planning
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Plan your bunker layout and operations for optimal resource
                    utilization.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "workers" && (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-white mb-4">
                    Bunker Workforce
                  </h2>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Understanding your workers and their roles is key to bunker
                    success
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/30">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-blue-500/30 rounded-2xl flex items-center justify-center">
                        <Factory className="w-8 h-8 text-blue-300" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          Production Workers
                        </h3>
                        <p className="text-blue-200">
                          Manufacturing specialists
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-300">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <span>Handle core manufacturing processes</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <Clock className="w-5 h-5 text-green-400" />
                        <span>24/7 production capability</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        <span>Scalable workforce</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/30">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-purple-500/30 rounded-2xl flex items-center justify-center">
                        <Settings className="w-8 h-8 text-purple-300" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          Support Workers
                        </h3>
                        <p className="text-purple-200">
                          Operations & maintenance
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-300">
                        <Shield className="w-5 h-5 text-green-400" />
                        <span>Maintain bunker security</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        <span>Monitor efficiency metrics</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        <span>Innovation & research</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "production" && (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-white mb-4">
                    Production Systems
                  </h2>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Maximize your bunker's output with optimized production
                    strategies
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-600/20 to-teal-800/20 backdrop-blur-sm rounded-3xl p-8 border border-emerald-500/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="w-10 h-10 text-emerald-300" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Resource Management
                      </h3>
                      <p className="text-emerald-200 text-sm">
                        Efficient allocation of materials and supplies
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-teal-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-10 h-10 text-teal-300" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Output Optimization
                      </h3>
                      <p className="text-teal-200 text-sm">
                        Maximize production efficiency and quality
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-10 h-10 text-blue-300" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Time Management
                      </h3>
                      <p className="text-blue-200 text-sm">
                        Optimize production schedules and timing
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "optimization" && (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-white mb-4">
                    Bunker Optimization
                  </h2>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Advanced tools and strategies to perfect your bunker
                    operations
                  </p>
                </div>

                <div className="bg-gradient-to-r from-indigo-600/20 to-purple-800/20 backdrop-blur-sm rounded-3xl p-8 border border-indigo-500/30">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">
                    🚀 Coming Soon: Advanced Optimization Tools
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                      <h4 className="text-lg font-semibold text-white mb-3">
                        Layout Analysis
                      </h4>
                      <p className="text-gray-300 text-sm">
                        Upload your bunker layout for AI-powered optimization
                        suggestions
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                      <h4 className="text-lg font-semibold text-white mb-3">
                        Worker Placement
                      </h4>
                      <p className="text-gray-300 text-sm">
                        Get recommendations for optimal worker positioning and
                        assignments
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                      <h4 className="text-lg font-semibold text-white mb-3">
                        Production Analytics
                      </h4>
                      <p className="text-gray-300 text-sm">
                        Detailed insights into your bunker's performance metrics
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                      <h4 className="text-lg font-semibold text-white mb-3">
                        Efficiency Reports
                      </h4>
                      <p className="text-gray-300 text-sm">
                        Comprehensive analysis of your bunker's operational
                        efficiency
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
