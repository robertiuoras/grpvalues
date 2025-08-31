"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  Plus,
  CheckCircle,
  Circle,
  Edit3,
  Trash2,
  Save,
  X,
  Lightbulb,
  Calendar,
  User,
} from "lucide-react";

interface Improvement {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  category: string;
  assignedTo: string;
  dueDate: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
}

export default function ImprovementsPage() {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    category: "",
    assignedTo: "",
    dueDate: "",
  });

  const priorityColors = {
    low: "border-green-500 text-green-500 bg-green-500/10",
    medium: "border-yellow-500 text-yellow-500 bg-yellow-500/10",
    high: "border-red-500 text-red-500 bg-red-500/10",
  };

  const priorityBadges = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  useEffect(() => {
    // Load improvements from API on mount
    fetchImprovements();
  }, []);

  const fetchImprovements = async () => {
    try {
      const response = await fetch("/api/improvements");
      if (response.ok) {
        const data = await response.json();
        setImprovements(data.improvements || []);
      } else {
        console.error("Failed to fetch improvements");
      }
    } catch (error) {
      console.error("Error fetching improvements:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      category: "",
      assignedTo: "",
      dueDate: "",
    });
    setEditingId(null);
  };

  const addImprovement = async () => {
    if (!formData.title.trim() || !formData.description.trim()) return;

    setIsLoadingOperation(true);
    setError(null);

    try {
      const response = await fetch("/api/improvements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setImprovements((prev) => [data.improvement, ...prev]);
        resetForm();
        setShowAddForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create improvement");
      }
    } catch (error) {
      console.error("Error creating improvement:", error);
      setError("Network error occurred");
    } finally {
      setIsLoadingOperation(false);
    }
  };

  const updateImprovement = async () => {
    if (!editingId || !formData.title.trim() || !formData.description.trim())
      return;

    try {
      const response = await fetch("/api/improvements", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingId,
          ...formData,
        }),
      });

      if (response.ok) {
        setImprovements((prev) =>
          prev.map((improvement) =>
            improvement.id === editingId
              ? {
                  ...improvement,
                  title: formData.title.trim(),
                  description: formData.description.trim(),
                  priority: formData.priority,
                  category: formData.category.trim(),
                  assignedTo: formData.assignedTo.trim(),
                  dueDate: formData.dueDate,
                }
              : improvement
          )
        );
        resetForm();
      } else {
        console.error("Failed to update improvement");
      }
    } catch (error) {
      console.error("Error updating improvement:", error);
    }
  };

  const startEditing = (improvement: Improvement) => {
    setFormData({
      title: improvement.title,
      description: improvement.description,
      priority: improvement.priority,
      category: improvement.category,
      assignedTo: improvement.assignedTo,
      dueDate: improvement.dueDate,
    });
    setEditingId(improvement.id);
    setShowAddForm(true);
  };

  const toggleCompletion = async (id: string) => {
    const improvement = improvements.find((imp) => imp.id === id);
    if (!improvement) return;

    const newCompletionStatus = !improvement.isCompleted;

    try {
      const response = await fetch("/api/improvements", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          isCompleted: newCompletionStatus,
        }),
      });

      if (response.ok) {
        setImprovements((prev) =>
          prev.map((imp) =>
            imp.id === id
              ? {
                  ...imp,
                  isCompleted: newCompletionStatus,
                  completedAt: newCompletionStatus
                    ? new Date().toISOString()
                    : undefined,
                }
              : imp
          )
        );
      } else {
        console.error("Failed to update completion status");
      }
    } catch (error) {
      console.error("Error updating completion status:", error);
    }
  };

  const deleteImprovement = async (id: string) => {
    if (confirm("Are you sure you want to delete this improvement?")) {
      try {
        const response = await fetch(`/api/improvements?id=${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setImprovements((prev) =>
            prev.filter((improvement) => improvement.id !== id)
          );
        } else {
          console.error("Failed to delete improvement");
        }
      } catch (error) {
        console.error("Error deleting improvement:", error);
      }
    }
  };

  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [isLoadingOperation, setIsLoadingOperation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredImprovements = improvements.filter((improvement) => {
    if (filter === "pending") return !improvement.isCompleted;
    if (filter === "completed") return improvement.isCompleted;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-7xl mx-auto px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
        <p className="text-gray-300">Loading improvements...</p>
      </div>
    );
  }

  if (!isAuthenticated || userRole !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300 max-w-md mx-auto">
            This page is only accessible to administrators. Please contact an
            admin if you need access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter">
      <main className="max-w-6xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6 shadow-2xl">
            <Lightbulb className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Improvements
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Track and manage improvement suggestions for Grand RP
          </p>
        </div>

        {/* Filter and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              All ({improvements.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                filter === "pending"
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              Pending ({improvements.filter((i) => !i.isCompleted).length})
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                filter === "completed"
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              Completed ({improvements.filter((i) => i.isCompleted).length})
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchImprovements}
              disabled={isLoadingOperation}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5">
                {isLoadingOperation ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                )}
              </div>
              {isLoadingOperation ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
            >
              {showAddForm ? (
                <X className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              {showAddForm ? "Cancel" : "Add Improvement"}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-center">{error}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white/10 rounded-2xl p-6 border border-white/20 mb-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingId ? "Edit Improvement" : "New Improvement"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Improvement title"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., UI, Features, Performance"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as "low" | "medium" | "high",
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedTo: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Developer name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the improvement in detail..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={editingId ? updateImprovement : addImprovement}
                disabled={isLoadingOperation}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingOperation ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : editingId ? (
                  <Edit3 className="w-5 h-5" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                {isLoadingOperation
                  ? "Saving..."
                  : editingId
                  ? "Update"
                  : "Add"}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {/* Improvements List */}
        {filteredImprovements.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lightbulb className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {filter === "all"
                ? "No Improvements Yet"
                : `No ${filter} Improvements`}
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {filter === "all"
                ? "Add your first improvement to start tracking development tasks!"
                : `No ${filter} improvements found. Try changing the filter or add new ones.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredImprovements.map((improvement) => (
              <div
                key={improvement.id}
                className={`bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 ${
                  improvement.isCompleted ? "opacity-75" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => toggleCompletion(improvement.id)}
                        className="text-2xl hover:scale-110 transition-transform duration-200"
                        title={
                          improvement.isCompleted
                            ? "Mark as pending"
                            : "Mark as completed"
                        }
                      >
                        {improvement.isCompleted ? (
                          <CheckCircle className="text-green-400" />
                        ) : (
                          <Circle className="text-gray-400 hover:text-blue-400" />
                        )}
                      </button>
                      <h3
                        className={`text-xl font-bold ${
                          improvement.isCompleted
                            ? "text-gray-400 line-through"
                            : "text-white"
                        }`}
                      >
                        {improvement.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          priorityColors[improvement.priority]
                        }`}
                      >
                        {priorityBadges[improvement.priority]}
                      </span>
                    </div>
                    <p
                      className={`text-gray-300 mb-3 ${
                        improvement.isCompleted ? "line-through" : ""
                      }`}
                    >
                      {improvement.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      {improvement.category && (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          {improvement.category}
                        </div>
                      )}
                      {improvement.assignedTo && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {improvement.assignedTo}
                        </div>
                      )}
                      {improvement.dueDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(improvement.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        Created{" "}
                        {new Date(improvement.createdAt).toLocaleDateString()}
                      </div>
                      {improvement.completedAt && (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          Completed{" "}
                          {new Date(
                            improvement.completedAt
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => startEditing(improvement)}
                      className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-110"
                      title="Edit improvement"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteImprovement(improvement.id)}
                      className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-300 hover:scale-110"
                      title="Delete improvement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
