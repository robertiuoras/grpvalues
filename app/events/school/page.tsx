"use client";

import React, { useState, useMemo, useEffect } from "react";

export default function ColorMixerPage() {
  const [targetColorInput, setTargetColorInput] = useState("");
  const [foundMix, setFoundMix] = useState<{
    color1: string;
    color2: string;
  } | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [suggestedColor, setSuggestedColor] = useState("");

  // Define all colors (primary and mixable results) and their display properties
  const allColorsWithHex = [
    { name: "RED", hex: "#EF4444", text: "white" },
    { name: "BLUE", hex: "#3B82F6", text: "white" },
    { name: "YELLOW", hex: "#FACC15", text: "black" },
    { name: "WHITE", hex: "#F9FAFB", text: "black" },
    { name: "BLACK", hex: "#1F2937", text: "white" },
    { name: "GREEN", hex: "#22C55E", text: "white" },
    { name: "ORANGE", hex: "#F97316", text: "white" },
    { name: "PURPLE", hex: "#A855F7", text: "white" },
    { name: "PINK", hex: "#EC4899", text: "white" },
    { name: "BROWN", hex: "#7C2D12", text: "white" },
    { name: "GRAY", hex: "#6B7280", text: "white" },
    { name: "CORAL", hex: "#FF7F50", text: "white" },
    { name: "TURQUOISE", hex: "#40E0D0", text: "black" },
    { name: "LIGHT BLUE", hex: "#ADD8E6", text: "black" },
    { name: "MINT", hex: "#98FB98", text: "black" },
    { name: "RASPBERRY", hex: "#E30B5C", text: "white" },
    { name: "KHAKI", hex: "#C3B091", text: "black" },
    { name: "TERRACOTTA", hex: "#E2725B", text: "white" },
    { name: "PLUM", hex: "#8E4585", text: "white" },
    { name: "LETTUCE", hex: "#BFFF00", text: "black" },
    { name: "BURGUNDY", hex: "#800020", text: "white" },
    { name: "PEACH", hex: "#FFDAB9", text: "black" },
    { name: "LAVENDER", hex: "#E6E6FA", text: "black" },
    { name: "YELLOW-GREEN", hex: "#9ACD32", text: "black" },
    { name: "GREEN-PINK", hex: "#C1E1C1", text: "black" },
    { name: "ORANGE-RED", hex: "#FF4500", text: "white" },
    { name: "CREAM", hex: "#FFFDD0", text: "black" },
    { name: "DARK RED", hex: "#8B0000", text: "white" },
    { name: "LIGHT PINK", hex: "#FFB6C1", text: "black" },
    { name: "RUSTY", hex: "#B7410E", text: "white" },
    { name: "LILAC", hex: "#C8A2C8", text: "black" },
    { name: "BEIGE", hex: "#F5F5DC", text: "black" },
    { name: "LEMON", hex: "#FFF700", text: "black" },
    { name: "DUSTY ROSE", hex: "#C9A9A6", text: "black" },
    { name: "PURPLISH RED", hex: "#8A0202", text: "white" },
    { name: "BLUE-ORANGE", hex: "#FF8C00", text: "white" },
    { name: "GOLDEN", hex: "#FFD700", text: "black" },
    { name: "APRICOT", hex: "#FBCEB1", text: "black" },
    { name: "EGGPLANT", hex: "#614051", text: "white" },
    { name: "DARK ORANGE", hex: "#FF8C00", text: "white" },
    { name: "GRAY-BLUE", hex: "#626D7A", text: "white" },
    { name: "OLIVE", hex: "#808000", text: "white" },
  ];

  // Hex values for quick lookup
  const colorToHex: { [key: string]: string } = useMemo(() => {
    const map: { [key: string]: string } = {};
    allColorsWithHex.forEach((color) => {
      map[color.name] = color.hex;
    });
    return map;
  }, [allColorsWithHex]);

  // Define simplified mixing rules for reverse lookup
  // Key: Resulting Color, Value: [Color1, Color2] (sorted alphabetically for consistency)
  const reverseMixingRules: { [key: string]: [string, string] } = useMemo(
    () => ({
      // Removed primary colors from being target keys based on user's instruction
      CORAL: ["RED", "ORANGE"],
      TURQUOISE: ["BLUE", "GREEN"],
      "LIGHT BLUE": ["BLUE", "WHITE"],
      MINT: ["GREEN", "WHITE"],
      LETTUCE: ["GREEN", "YELLOW"],
      RASPBERRY: ["PINK", "RED"],
      KHAKI: ["BLACK", "BROWN"],
      TERRACOTTA: ["BROWN", "ORANGE"],
      PLUM: ["PINK", "PURPLE"],
      BURGUNDY: ["BLUE", "RED"],
      PEACH: ["ORANGE", "WHITE"],
      LAVENDER: ["PURPLE", "WHITE"],
      "YELLOW-GREEN": ["GREEN", "ORANGE"],
      "GREEN-PINK": ["GREEN", "PINK"],
      "ORANGE-RED": ["ORANGE", "RED"],
      CREAM: ["PINK", "YELLOW"],
      "DARK RED": ["BLACK", "RED"],
      "LIGHT PINK": ["PINK", "WHITE"],
      RUSTY: ["BROWN", "RED"],
      "RED-ORANGE": ["ORANGE", "RED"],
      "RED-GREEN": ["GREEN", "RED"],
      LILAC: ["BLUE", "PINK"],
      BEIGE: ["BROWN", "WHITE"],
      LEMON: ["YELLOW", "WHITE"],
      "DUSTY ROSE": ["BROWN", "PINK"],
      "PURPLISH RED": ["PURPLE", "RED"],
      "BLUE-ORANGE": ["BLUE", "ORANGE"],
      GOLDEN: ["ORANGE", "YELLOW"],
      APRICOT: ["ORANGE", "PINK"],
      EGGPLANT: ["BROWN", "PURPLE"],
      "DARK ORANGE": ["BLACK", "ORANGE"],
      "GRAY-BLUE": ["BLUE", "GRAY"],
      OLIVE: ["BLACK", "YELLOW"],
    }),
    []
  );

  // Clear input field on component mount and ensure no autofill
  useEffect(() => {
    setTargetColorInput("");
  }, []);

  // Find suggested color for autocomplete
  useEffect(() => {
    if (targetColorInput.trim()) {
      const availableColors = Object.keys(reverseMixingRules);
      const suggested = availableColors.find(color =>
        color.toLowerCase().startsWith(targetColorInput.toLowerCase())
      );
      setSuggestedColor(suggested || "");
    } else {
      setSuggestedColor("");
    }
  }, [targetColorInput, reverseMixingRules]);

  const handleFindMix = () => {
    const cleanedTargetColor = targetColorInput.trim().toUpperCase();
    if (!cleanedTargetColor) {
      setFeedbackMessage("Please enter a color.");
      setFoundMix(null);
      return;
    }

    if (reverseMixingRules[cleanedTargetColor]) {
      const [color1, color2] = reverseMixingRules[cleanedTargetColor];
      setFoundMix({ color1, color2 });
      setFeedbackMessage(`To get ${cleanedTargetColor}, mix:`);
    } else {
      const formattedColorName =
        cleanedTargetColor.charAt(0).toUpperCase() +
        cleanedTargetColor.slice(1).toLowerCase();
      // const availableMixableColorNames = Object.keys(reverseMixingRules).sort().join(', '); // Removed this for brevity as requested
      setFeedbackMessage(
        `Sorry, I don't know how to make ${formattedColorName}. Are you sure you spelt it correctly?`
      );
      setFoundMix(null);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter">
      <main className="max-w-xl mx-auto bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 sm:p-12 lg:p-14 border border-blue-100 text-center relative overflow-hidden">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 leading-tight mb-8 drop-shadow-md relative z-10 flex items-center justify-center gap-4">
          <span role="img" aria-label="beaker">
            🔬
          </span>
          Chemistry
          <span role="img" aria-label="test tube">
            🧪
          </span>
        </h1>

        <div className="mb-8 relative z-10">
          <label
            htmlFor="targetColor"
            className="block text-xl font-semibold text-gray-700 mb-4"
          >
            WHAT COLOR DO YOU WANT TO CREATE?
          </label>
          <div className="relative">
            <div className="relative">
              <input
                id="targetColor"
                type="text"
                value={targetColorInput}
                onChange={(e) => {
                  setTargetColorInput(e.target.value);
                  setFeedbackMessage("");
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleFindMix();
                }}
                placeholder="e.g., Coral, Raspberry, or Lavender"
                className="w-full p-4 border border-blue-300 rounded-xl text-xl text-center focus:outline-none focus:ring-4 focus:ring-blue-500 shadow-md transition-all duration-200 text-black placeholder-gray-500 bg-white/70"
                autoComplete="off" // Disable autofill/autocomplete
              />
              
              {/* Clickable autocomplete helper right next to user's text */}
              {suggestedColor && suggestedColor !== targetColorInput && (
                <div className="absolute inset-0 flex items-center">
                  <span className="text-xl text-gray-900 font-normal">
                    {targetColorInput}
                    <button
                      onClick={() => {
                        setTargetColorInput(suggestedColor);
                        setFeedbackMessage("");
                      }}
                      className="text-gray-900/60 hover:text-gray-900/80 cursor-pointer font-normal transition-colors duration-200 hover:underline bg-gray-100/50 px-2 py-1 rounded hover:bg-gray-200/50 ml-1"
                    >
                      {suggestedColor.slice(targetColorInput.length)}
                    </button>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SHOW MIX BUTTON */}
        <button
          onClick={handleFindMix}
          className="relative z-10 bg-gradient-to-r from-blue-500 to-indigo-500
                     hover:from-blue-600 hover:to-indigo-600 text-white font-bold
                     py-4 px-10 rounded-full text-xl transition-opacity duration-300 hover:opacity-90
                     focus:outline-none focus:ring-4 focus:ring-blue-400 mb-8"
        >
          SHOW MIX
        </button>

        {feedbackMessage && (
          <p
            className={`relative z-10 text-lg font-medium mt-6 p-4 rounded-xl
            ${
              foundMix
                ? "bg-green-100 text-green-800 border-green-300"
                : "bg-red-100 text-red-800 border-red-300"
            }
            border shadow-md`}
          >
            {feedbackMessage}
          </p>
        )}

        {foundMix && (
          <div className="relative z-10 mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className="p-6 rounded-xl shadow-xl border border-gray-300 text-2xl font-bold flex items-center justify-center h-32 transition-transform duration-200 hover:scale-105 relative overflow-hidden group"
              style={{
                backgroundColor: colorToHex[foundMix.color1] || "#D1D5DB",
                color:
                  allColorsWithHex.find((c) => c.name === foundMix.color1)
                    ?.text || "black",
              }}
            >
              {foundMix.color1}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
            </div>
            <div
              className="p-6 rounded-xl shadow-xl border border-gray-300 text-2xl font-bold flex items-center justify-center h-32 transition-transform duration-200 hover:scale-105 relative overflow-hidden group"
              style={{
                backgroundColor: colorToHex[foundMix.color2] || "#D1D5DB",
                color:
                  allColorsWithHex.find((c) => c.name === foundMix.color2)
                    ?.text || "black",
              }}
            >
              {foundMix.color2}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
