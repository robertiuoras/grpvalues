"use client";

import React, { useState } from "react";
import { Trophy, Star, Zap, Target, Award, TrendingUp } from "lucide-react";

interface BattlepassTier {
  id: number;
  name: string;
  description: string;
  rewards: string[];
  requiredXP: number;
  isUnlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const BattlepassPage: React.FC = () => {
  const [currentXP, setCurrentXP] = useState(1250);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  const battlepassTiers: BattlepassTier[] = [
    {
      id: 1,
      name: "Rookie Grinder",
      description: "Start your journey with basic rewards",
      rewards: ["$5,000", "Basic Mask", "Starter Vehicle"],
      requiredXP: 0,
      isUnlocked: true,
      rarity: "common"
    },
    {
      id: 2,
      name: "Street Hustler",
      description: "Prove your worth in the streets",
      rewards: ["$10,000", "Premium Clothing", "Weapon License"],
      requiredXP: 500,
      isUnlocked: currentXP >= 500,
      rarity: "common"
    },
    {
      id: 3,
      name: "Gang Leader",
      description: "Establish your dominance",
      rewards: ["$25,000", "Gang Hideout", "Advanced Weapons"],
      requiredXP: 1000,
      isUnlocked: currentXP >= 1000,
      rarity: "rare"
    },
    {
      id: 4,
      name: "Crime Boss",
      description: "Rule the underground",
      rewards: ["$50,000", "Luxury Vehicle", "Bodyguard Service"],
      requiredXP: 2000,
      isUnlocked: currentXP >= 2000,
      rarity: "epic"
    },
    {
      id: 5,
      name: "Kingpin",
      description: "The ultimate criminal mastermind",
      rewards: ["$100,000", "Private Island", "Helicopter", "Unlimited Power"],
      requiredXP: 5000,
      isUnlocked: currentXP >= 5000,
      rarity: "legendary"
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "border-gray-400 text-gray-400";
      case "rare": return "border-blue-400 text-blue-400";
      case "epic": return "border-purple-400 text-purple-400";
      case "legendary": return "border-yellow-400 text-yellow-400";
      default: return "border-gray-400 text-gray-400";
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "common": return <Star className="w-4 h-4" />;
      case "rare": return <Zap className="w-4 h-4" />;
      case "epic": return <Target className="w-4 h-4" />;
      case "legendary": return <Trophy className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const nextTier = battlepassTiers.find(tier => !tier.isUnlocked);
  const progressToNext = nextTier ? ((currentXP - (nextTier.requiredXP - 500)) / 500) * 100 : 100;

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

        {/* Progress Overview */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Current Level</h2>
                <p className="text-gray-400">XP: {currentXP.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Next Tier</p>
              <p className="text-xl font-bold text-purple-400">
                {nextTier ? nextTier.name : "MAXED OUT!"}
              </p>
            </div>
          </div>
          
          {nextTier && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to {nextTier.name}</span>
                <span>{Math.round(progressToNext)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressToNext, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Battlepass Tiers */}
        <div className="grid gap-6">
          {battlepassTiers.map((tier) => (
            <div
              key={tier.id}
              className={`bg-black/30 backdrop-blur-sm rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                tier.isUnlocked 
                  ? "border-green-500/50 bg-green-500/10" 
                  : "border-gray-600/50 hover:border-purple-500/50"
              } ${selectedTier === tier.id ? "ring-4 ring-purple-500/50" : ""}`}
              onClick={() => setSelectedTier(selectedTier === tier.id ? null : tier.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${getRarityColor(tier.rarity)}`}>
                    {getRarityIcon(tier.rarity)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{tier.name}</h3>
                    <p className="text-gray-400">{tier.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    tier.isUnlocked 
                      ? "bg-green-500/20 text-green-400 border border-green-500/50" 
                      : "bg-gray-500/20 text-gray-400 border border-gray-500/50"
                  }`}>
                    {tier.isUnlocked ? "UNLOCKED" : `${tier.requiredXP} XP`}
                  </div>
                </div>
              </div>

              {selectedTier === tier.id && (
                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-semibold mb-3 text-purple-300">Rewards:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tier.rewards.map((reward, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-white/5 rounded-lg px-3 py-2">
                        <Award className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm">{reward}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* How to Earn XP */}
        <div className="mt-12 bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
          <h2 className="text-2xl font-bold mb-6 text-center text-purple-300">How to Earn XP</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/50">
                <Target className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Complete Missions</h3>
              <p className="text-gray-400 text-sm">Finish daily and weekly challenges</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                <Zap className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Win Battles</h3>
              <p className="text-gray-400 text-sm">Defeat other players in combat</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/50">
                <Star className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Achieve Goals</h3>
              <p className="text-gray-400 text-sm">Reach milestones and objectives</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattlepassPage;
