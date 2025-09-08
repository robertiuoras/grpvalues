"use client";

import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Building2 } from "lucide-react";

export default function BeginnerHelpPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState<string>("basic-tips");

  // Show a loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-7xl mx-auto px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
        <p className="text-gray-300">Loading content...</p>
      </div>
    );
  }

  // Page is now public - no authentication required

  const handleButtonClick = (section: string) => {
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "basic-tips":
        return (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center justify-center gap-2">
              ⚠️ Basic Tips ⚠️
            </h2>
            <div className="space-y-4 text-green-700">
              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="font-bold">🔹 Free $25,000</h3>
                <p>
                  📱 Phone &gt; Gifts &gt; Promo &gt; Enter Code:{" "}
                  <span className="font-mono bg-green-200 px-2 py-1 rounded">
                    GRANDNOW
                  </span>
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="font-bold">
                  🔹 Daily Investment (Up to $150k/day)
                </h3>
                <p>Match the number of hours you plan to play that day.</p>
                <p>
                  📱 Phone &gt; Bottom-Right App &gt; Short-Term Investment &gt;
                  Select Your Time
                </p>
                <p>🕓 Server resets at 4:00 AM server-time.</p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="font-bold">🔹 Daily Tasks ($5k/task)</h3>
                <p>🅼 Press M &gt; Click Daily Tasks</p>
                <p>
                  Complete all three tasks (usually quick and easy), then hit
                  the yellow button to send the reward to your post office.
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="font-bold">🔹 Daily Office (~$60-115k/day)</h3>
                <p>
                  📍 Go to the Office (blue "A" icon on the map, west of the
                  hospital).
                </p>
                <p>
                  Start any available tasks 💵{" "}
                  <span className="font-bold">
                    $10,800 per task 6 tasks every daily❗
                  </span>
                </p>
                <p>
                  ➡️{" "}
                  <span className="font-bold">
                    How to get almost double bonus (~$115k/day)❓
                  </span>
                </p>
                <p>
                  Use office{" "}
                  <span className="font-mono bg-green-200 px-2 py-1 rounded">
                    160825
                  </span>{" "}
                  then send Screenshot of completed tasks after you done to{" "}
                  <span className="font-mono bg-green-200 px-2 py-1 rounded">
                    robthemaster
                  </span>{" "}
                  on discord.
                </p>
                <p>
                  You will get{" "}
                  <span className="font-bold">$7,000 extra per task</span> 💰
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="font-bold">🔹 Solar Plantation ($10k/day)</h3>
                <p>Check the top-left ads for Solar Planting jobs.</p>
                <p>🌱 Takes just 10 seconds to plant solar for someone.</p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="font-bold">🔹 Casino Spin (~$10k/day)</h3>
                <p>
                  🎰 After 4 hours of playtime, head to the Casino and spin the
                  big wheel.
                </p>
                <p>💰 Cash out winnings at the front desk.</p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="font-bold">🔹 Shards System</h3>
                <p>
                  Every hour you get{" "}
                  <span className="font-bold">20 shards points</span>. You have
                  a lot of containers to open in shards shop the cost{" "}
                  <span className="font-bold">100 shards points</span> each.
                </p>
                <p>
                  Make sure to use all of them to get unique high value cars &
                  store the items to recycle them for more shards points.
                </p>
                <p>
                  Best container to invest is the bottom right Ubermacht Hommage
                  one as far the state value of the car is{" "}
                  <span className="font-bold">$25 Million</span>.
                </p>
              </div>
            </div>
          </div>
        );

      case "office":
        return (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center justify-center gap-2">
              🏢 Office Guide
            </h2>
            <div className="space-y-4 text-blue-700">
              <div className="border-l-4 border-blue-400 pl-4">
                <h3 className="font-bold">📍 Location</h3>
                <p>Blue "A" icon on the map, west of the hospital</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <h3 className="font-bold">💰 Daily Earnings</h3>
                <p>Complete 6 tasks daily for $10,800 each</p>
                <p>Total: $64,800 per day</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <h3 className="font-bold">🚀 Bonus with my Office</h3>
                <p>Use office N.160825 for extra $7,000 per task</p>
                <p>Total with bonus: $115,800 per day</p>
              </div>
            </div>
          </div>
        );

      case "starter-jobs":
        return (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200">
            <h2 className="text-2xl font-bold text-red-800 mb-4 flex items-center justify-center gap-2">
              ⚠️ Best Starter Jobs ⚠️
            </h2>
            <div className="space-y-4 text-red-700">
              <div className="border-l-4 border-red-400 pl-4">
                <h3 className="font-bold">🔹 Level 1 in city: Farmer</h3>
                <p>
                  Each seed harvested is worth{" "}
                  <span className="font-bold">$2,500</span>.
                </p>
                <p>
                  You will find the farm at the north of the map as F green
                  sign.
                </p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <h3 className="font-bold">🔹 Level 5 in city: Firefighter</h3>
                <p>
                  At Skill Level 3, you earn{" "}
                  <span className="font-bold">$500/fire</span>. Find a 3-fire
                  route and rotate for efficient farming.
                </p>
                <p>
                  You will find the fire station at the south-east of the map as
                  red sign.
                </p>
              </div>
            </div>
          </div>
        );

      case "saving-tips":
        return (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200">
            <h2 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center justify-center gap-2">
              ⚠️ Saving Tips ⚠️
            </h2>
            <div className="space-y-4 text-indigo-700">
              <div className="border-l-4 border-indigo-400 pl-4">
                <h3 className="font-bold">🔹 Avoid ATMs</h3>
                <p>NEVER use ATMs unless you're robbing them.</p>
                <p>
                  ⚙️ M &gt; Settings &gt; Turn off ATM markers on the minimap.
                </p>
                <p>🏦 Use a bank to avoid 5–10% withdrawal tax.</p>
              </div>
              <div className="border-l-4 border-indigo-400 pl-4">
                <h3 className="font-bold">🔹 Don't Get Scammed</h3>
                <p>
                  Always ask around for price checks or trusted connections
                  before buying anything.
                </p>
                <p>
                  ✅ Double-check item prices. Avoid off-tax trades—they're
                  often scams.
                </p>
                <p>
                  💬 Most of us have been scammed before. Ask first, we'll help!
                </p>
              </div>
              <div className="border-l-4 border-indigo-400 pl-4">
                <h3 className="font-bold">🔹 Best Beginner Car</h3>
                <p>🚗 Future Shock Issi</p>
                <p>
                  Cost: <span className="font-bold">$12k</span> – Fully
                  upgraded, it can reach ~200 mph. Great value starter vehicle!
                </p>
              </div>
              <div className="border-l-4 border-indigo-400 pl-4">
                <h3 className="font-bold">🔹 Car Insurance is Essential</h3>
                <p>✅ Protects your car from being stolen or destroyed.</p>
                <p>If stolen, you'll pay a hefty recovery fine.</p>
                <p>🛡️ Insurance is highly recommended on GRP Database.</p>
              </div>
              <div className="border-l-4 border-indigo-400 pl-4">
                <h3 className="font-bold">🔹 Pocket Change Caution</h3>
                <p>
                  💸 Don't carry too much cash—if robbed, you lose 50% of your
                  cash (up to $50k).
                </p>
                <p>Carry only what you need, keep the rest in the bank.</p>
              </div>
            </div>
          </div>
        );

      case "treasure":
        return (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
            <h2 className="text-2xl font-bold text-amber-800 mb-4 flex items-center justify-center gap-2">
              📦 Treasure 📦
            </h2>
            <div className="space-y-4 text-amber-700">
              <div className="border-l-4 border-amber-400 pl-4">
                <p>
                  🔹 Every hour you can claim a personal treasure case, Open
                  your phone and press on treasure button for more info 📲
                </p>
              </div>
              <div className="border-l-4 border-amber-400 pl-4">
                <p>
                  🔹 Use treasure map to navigate your personal treasure. You
                  will get desert scarf containers each worth{" "}
                  <span className="font-bold">~$10,000 - $15,000</span>💰
                </p>
              </div>
              <div className="border-l-4 border-amber-400 pl-4">
                <p>
                  🔹 Use wood to craft treasure maps you get 3 treasure map for
                  each 1 wood 🪵
                </p>
              </div>
              <div className="border-l-4 border-amber-400 pl-4 text-center">
                <p className="mb-4">
                  🔍 Need help finding your treasure location?
                </p>
                <button
                  onClick={() => (window.location.href = "/treasure-helper")}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg transform hover:-translate-y-1"
                >
                  🗺️ Treasure Helper Tool
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter">
      <main className="max-w-6xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl">
            <span className="text-3xl">📚</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Beginner Help
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Master GRP Database with our comprehensive guide. Learn the best
            strategies to maximize your earnings and dominate the server.
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16 max-w-4xl mx-auto">
          {/* Row 1: Basic Tips, Saving Tips, Office */}
          <div
            onClick={() => handleButtonClick("basic-tips")}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
          >
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 h-full shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl">💡</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Basic Tips
                </h3>
                <p className="text-green-100 text-xs">
                  Essential strategies to get started
                </p>
              </div>
            </div>
          </div>

          <div
            onClick={() => handleButtonClick("saving-tips")}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 h-full shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl">💰</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Saving Tips
                </h3>
                <p className="text-indigo-100 text-xs">
                  Protect your money and avoid scams
                </p>
              </div>
            </div>
          </div>

          <div
            onClick={() => handleButtonClick("office")}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
          >
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 h-full shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl">🏢</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Office</h3>
                <p className="text-blue-100 text-xs">
                  Maximize your daily office earnings
                </p>
              </div>
            </div>
          </div>

          {/* Row 2: Treasure, Starter Jobs */}
          <div
            onClick={() => handleButtonClick("treasure")}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 lg:col-start-1 lg:col-end-2"
          >
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 h-full shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl">📦</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Treasure</h3>
                <p className="text-amber-100 text-xs">
                  Find hidden treasures and earn rewards
                </p>
              </div>
            </div>
          </div>

          <div
            onClick={() => handleButtonClick("starter-jobs")}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 lg:col-start-3 lg:col-end-4"
          >
            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-4 h-full shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl">💼</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Starter Jobs
                </h3>
                <p className="text-red-100 text-xs">
                  Best jobs for new players
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Content Display */}
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 border border-white border-opacity-20">
          <div className="text-left max-w-5xl mx-auto">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
}
