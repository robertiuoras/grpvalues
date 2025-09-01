"use client";

import React, { useState } from "react";
import { Trophy, Star, Zap, Target, Award, TrendingUp } from "lucide-react";

const BattlepassPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'cars'>('daily');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-12 h-12 text-yellow-400 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              BATTLEPASS
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Complete challenges, earn XP, and unlock exclusive rewards in the ultimate criminal progression system
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-2 border border-purple-500/30">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('daily')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'daily'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Daily Tasks
              </button>
              <button
                onClick={() => setActiveTab('weekly')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'weekly'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Weekly Tasks
              </button>
              <button
                onClick={() => setActiveTab('cars')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'cars'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Current Battlepass Cars
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 min-h-96">
          {activeTab === 'daily' && (
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6 text-purple-300">Daily Tasks</h2>
              <p className="text-gray-400 text-lg mb-8">Complete daily challenges to earn XP and rewards</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/50">
                    <Target className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Complete 5 Missions</h3>
                  <p className="text-gray-400 text-sm">Reward: 100 XP</p>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                    <Zap className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Win 3 Battles</h3>
                  <p className="text-gray-400 text-sm">Reward: 150 XP</p>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/50">
                    <Star className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Earn $10,000</h3>
                  <p className="text-gray-400 text-sm">Reward: 200 XP</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'weekly' && (
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6 text-purple-300">Weekly Tasks</h2>
              <p className="text-gray-400 text-lg mb-8">Tackle weekly challenges for bigger rewards</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/50">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Complete 20 Missions</h3>
                  <p className="text-gray-400 text-sm">Reward: 500 XP</p>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50">
                    <TrendingUp className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Reach Level 10</h3>
                  <p className="text-gray-400 text-sm">Reward: 1000 XP</p>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/50">
                    <Award className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Unlock 5 Items</h3>
                  <p className="text-gray-400 text-sm">Reward: 750 XP</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cars' && (
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6 text-purple-300">Current Battlepass Cars</h2>
              <div className="flex justify-center">
                <img 
                  src="/images/battlepass.png" 
                  alt="Battlepass Cars" 
                  className="max-w-full h-auto rounded-xl shadow-2xl"
                  style={{ maxHeight: '800px', minHeight: '600px' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattlepassPage;
