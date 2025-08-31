"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Clock, Play, Pause, RotateCcw, Bell, Settings } from "lucide-react";

interface PetTimer {
  id: string;
  name: string;
  endTime: number;
  isActive: boolean;
  color: string;
}

export default function PetTimerPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTimer, setCurrentTimer] = useState<PetTimer | null>(null);
  const [newTimerName, setNewTimerName] = useState("");
  const [newTimerHours, setNewTimerHours] = useState(0);
  const [newTimerMinutes, setNewTimerMinutes] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement>();

  // Timer colors for visual variety
  const timerColors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-blue-500",
    "from-pink-500 to-rose-500",
  ];

  // Check for notification permission and enable if granted
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true);
      } else if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          setNotificationsEnabled(permission === "granted");
        });
      }
    }
  }, []);

  // Load timer from localStorage on mount
  useEffect(() => {
    const savedTimer = localStorage.getItem("petTimer");
    if (savedTimer) {
      setCurrentTimer(JSON.parse(savedTimer));
    }
  }, []);

  // Save timer to localStorage whenever it changes
  useEffect(() => {
    if (currentTimer) {
      localStorage.setItem("petTimer", JSON.stringify(currentTimer));
    } else {
      localStorage.removeItem("petTimer");
    }
  }, [currentTimer]);

  // Update current time every second and check for expired timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      // Check for expired timer and send notifications
      if (
        currentTimer &&
        currentTimer.isActive &&
        now >= currentTimer.endTime
      ) {
        // Timer expired - send notification
        if (notificationsEnabled) {
          new Notification("🐾 Pet Timer Complete!", {
            body: `${currentTimer.name} is ready!`,
            icon: "/favicon.ico",
            tag: currentTimer.id,
          });
        }

        // Play sound notification
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
        }

        // Mark timer as inactive
        setCurrentTimer((prev) => (prev ? { ...prev, isActive: false } : null));
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentTimer, notificationsEnabled]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");
    }
  };

  // Add new timer (replaces current timer)
  const addTimer = () => {
    if (
      !newTimerName.trim() ||
      (newTimerHours === 0 && newTimerMinutes === 0)
    ) {
      return;
    }

    const totalMinutes = newTimerHours * 60 + newTimerMinutes;
    const endTime = Date.now() + totalMinutes * 60 * 1000;
    const color = timerColors[0]; // Use first color for single timer

    const newTimer: PetTimer = {
      id: Date.now().toString(),
      name: newTimerName.trim(),
      endTime,
      isActive: true,
      color,
    };

    setCurrentTimer(newTimer);
    setNewTimerName("");
    setNewTimerHours(0);
    setNewTimerMinutes(0);
    setShowAddForm(false);
  };

  // Toggle timer pause/resume
  const toggleTimer = () => {
    if (!currentTimer) return;

    if (currentTimer.isActive) {
      // Pause timer
      setCurrentTimer({ ...currentTimer, isActive: false });
    } else {
      // Resume timer - adjust end time
      const remainingTime = currentTimer.endTime - currentTime;
      if (remainingTime > 0) {
        setCurrentTimer({
          ...currentTimer,
          endTime: Date.now() + remainingTime,
          isActive: true,
        });
      } else {
        setCurrentTimer({ ...currentTimer, isActive: false });
      }
    }
  };

  // Reset timer
  const resetTimer = () => {
    if (!currentTimer) return;

    const originalDuration =
      currentTimer.endTime -
      (Date.now() - (currentTimer.endTime - currentTime));
    setCurrentTimer({
      ...currentTimer,
      endTime: Date.now() + originalDuration,
      isActive: true,
    });
  };

  // Delete timer
  const deleteTimer = () => {
    setCurrentTimer(null);
  };

  // Calculate remaining time for a timer
  const getRemainingTime = (timer: PetTimer) => {
    if (!timer.isActive) return 0;
    const remaining = Math.max(0, timer.endTime - currentTime);
    return Math.floor(remaining / 1000);
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate circle progress
  const getCircleProgress = (timer: PetTimer) => {
    if (!timer.isActive) return 0;
    const totalDuration =
      timer.endTime - (Date.now() - (timer.endTime - currentTime));
    const remaining = getRemainingTime(timer);
    const progress = ((totalDuration - remaining) / totalDuration) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-7xl mx-auto px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
        <p className="text-gray-300">Loading pet timer...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter">
      <main className="max-w-6xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-6 shadow-2xl">
            <span className="text-3xl">🐾</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Pet Timer
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Track your pet timer with beautiful countdown circles and
            notifications
          </p>
        </div>

        {/* Notification Settings */}
        <div className="bg-white/10 rounded-2xl p-6 border border-white/20 mb-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-purple-300" />
              <span className="text-white font-semibold">Notifications</span>
            </div>
            <button
              onClick={requestNotificationPermission}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                notificationsEnabled
                  ? "bg-green-600 text-white"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              {notificationsEnabled ? "Enabled" : "Enable"}
            </button>
          </div>
          {!notificationsEnabled && (
            <p className="text-gray-400 text-sm mt-2">
              Enable notifications to get alerts when your pet timer is ready!
            </p>
          )}
        </div>

        {/* Add Timer Form */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg text-lg transform hover:-translate-y-1"
          >
            {showAddForm
              ? "Cancel"
              : currentTimer
              ? "🔄 Replace Timer"
              : "➕ Add New Timer"}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white/10 rounded-2xl p-6 border border-white/20 mb-8 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {currentTimer ? "Replace Pet Timer" : "New Pet Timer"}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Pet Name (e.g., Dog, Cat, Bird)"
                value={newTimerName}
                onChange={(e) => setNewTimerName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-300 mb-2">
                    Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={newTimerHours}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || value === "0") {
                        setNewTimerHours(0);
                      } else {
                        const parsed = parseInt(value);
                        if (!isNaN(parsed) && parsed >= 0 && parsed <= 24) {
                          setNewTimerHours(parsed);
                        }
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-300 mb-2">
                    Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={newTimerMinutes}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || value === "0") {
                        setNewTimerMinutes(0);
                      } else {
                        const parsed = parseInt(value);
                        if (!isNaN(parsed) && parsed >= 0 && parsed <= 59) {
                          setNewTimerMinutes(parsed);
                        }
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <button
                onClick={addTimer}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105"
              >
                {currentTimer ? "Replace Timer" : "Start Timer"}
              </button>
            </div>
          </div>
        )}

        {/* Single Timer Display */}
        {!currentTimer ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Clock className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">No Timer Set</h3>
            <p className="text-gray-400 max-w-md mx-auto text-lg">
              Add a pet timer to start tracking when your pet will be ready!
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="bg-white/10 rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 max-w-2xl w-full">
              {/* Timer Circle - Much Bigger */}
              <div className="relative w-64 h-64 mx-auto mb-8">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${
                      2 *
                      Math.PI *
                      45 *
                      (1 - getCircleProgress(currentTimer) / 100)
                    }`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Timer content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-center">
                    <div
                      className={`text-5xl font-bold ${
                        getRemainingTime(currentTimer) <= 0
                          ? "text-green-400"
                          : "text-white"
                      }`}
                    >
                      {getRemainingTime(currentTimer) <= 0
                        ? "Ready!"
                        : formatTime(getRemainingTime(currentTimer))}
                    </div>
                    <div className="text-lg text-gray-300 mt-2">
                      {getRemainingTime(currentTimer) <= 0
                        ? "Timer Complete"
                        : "Remaining"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timer Info */}
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-3">
                  {currentTimer.name}
                </h3>
                <div className="flex items-center justify-center gap-3 text-lg text-gray-300">
                  <Clock className="w-6 h-6" />
                  <span>{currentTimer.isActive ? "Running" : "Paused"}</span>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={toggleTimer}
                  className={`p-4 rounded-xl transition-all duration-300 hover:scale-110 ${
                    currentTimer.isActive
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                  title={currentTimer.isActive ? "Pause Timer" : "Resume Timer"}
                >
                  {currentTimer.isActive ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>
                <button
                  onClick={resetTimer}
                  className="p-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-110"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
                <button
                  onClick={deleteTimer}
                  className="p-4 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all duration-300 hover:scale-110"
                  title="Delete Timer"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Hidden audio element for notifications */}
      <audio ref={audioRef} preload="auto">
        <source
          src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"
          type="audio/wav"
        />
      </audio>
    </div>
  );
}
