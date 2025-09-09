"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLanguage } from "../../../lib/languageContext";

export default function ColorMixerPage() {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [targetColorInput, setTargetColorInput] = useState("");
  const [foundMix, setFoundMix] = useState<{
    color1: string;
    color2: string;
  } | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [suggestedColor, setSuggestedColor] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

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
    const input = targetColorInput.trim().toLowerCase();
    if (!input) {
      setSuggestedColor("");
      return;
    }

    const availableColors = Object.keys(reverseMixingRules);
    const suggested = availableColors.find((color) =>
      color.toLowerCase().startsWith(input)
    );

    if (!suggested) {
      setSuggestedColor("");
      return;
    }

    // Only show suggestion if there is a suffix to display
    if (suggested.toLowerCase() !== input) {
      setSuggestedColor(suggested);
    } else {
      setSuggestedColor("");
    }
  }, [targetColorInput, reverseMixingRules]);

  // Animation function for autocomplete
  const animateAutocomplete = (newValue: string) => {
    setIsAnimating(true);

    // Animate text building by gradually revealing characters
    const currentText = targetColorInput;
    const newText = newValue.toLowerCase();
    const charsToAdd = newText.slice(currentText.length);

    if (charsToAdd.length > 0) {
      let currentIndex = currentText.length;
      const interval = setInterval(() => {
        if (currentIndex < newText.length) {
          setTargetColorInput(newText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(interval);
          setSuggestedColor(""); // Clear suggestion after animation
          setFeedbackMessage("");
          // Focus and place cursor at the end
          requestAnimationFrame(() => {
            const el = inputRef.current;
            if (el) {
              el.focus({ preventScroll: true });
              const valueLength = el.value.length;
              try {
                el.setSelectionRange(valueLength, valueLength);
              } catch {}
            }
          });
          setTimeout(() => setIsAnimating(false), 100);
        }
      }, 50); // 50ms delay between each character
    } else {
      setTargetColorInput(newText);
      setSuggestedColor("");
      setFeedbackMessage("");
      setTimeout(() => setIsAnimating(false), 100);
    }
  };

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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 relative overflow-hidden">
      {/* Subtle, scoped background overlay (won't affect other pages) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(60rem 30rem at 50% 110%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(40rem 20rem at -10% -10%, rgba(99,102,241,0.18), transparent 60%), radial-gradient(40rem 20rem at 110% -10%, rgba(20,184,166,0.18), transparent 60%)",
        }}
      />

      <div className="flex items-start sm:items-center justify-center min-h-screen py-2 sm:py-8">
        <main className="w-full max-w-md sm:max-w-lg bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-4 sm:p-6 border border-white/30 text-center relative overflow-hidden transition-all duration-300 mb-4 sm:mb-0">
        {/* Accent gradient bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 leading-tight mb-6 drop-shadow-md relative z-10 flex items-center justify-center gap-3">
          <span role="img" aria-label="beaker">
            🔬
          </span>
          {t('events.school.chemistry')}
          <span role="img" aria-label="test tube" className="animate-pulse">
            🧪
          </span>
        </h1>

        <div className="mb-6 relative z-10">
          <label
            htmlFor="targetColor"
            className="block text-lg font-semibold text-gray-700 mb-3"
          >
            WHAT COLOR DO YOU WANT TO CREATE?
          </label>
          <div className="relative">
            <div className="relative">
              <input
                id="targetColor"
                type="text"
                ref={inputRef}
                value={targetColorInput}
                onChange={(e) => {
                  setTargetColorInput(e.target.value);
                  setFeedbackMessage("");
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleFindMix();
                }}
                placeholder="e.g., Coral, Raspberry, or Lavender"
                className="w-full p-4 rounded-xl text-xl text-center focus:outline-none text-black placeholder-gray-500 bg-white/80 border border-gray-200 shadow-lg transition-all duration-200"
                autoComplete="off" // Disable autofill/autocomplete
              />

              {/* Clickable autocomplete helper positioned after user's text */}
              {suggestedColor && suggestedColor !== targetColorInput && (
                <div className="absolute inset-0 flex items-center pointer-events-none">
                  <span
                    className="text-xl text-gray-900 font-normal absolute pointer-events-auto"
                    style={{
                      left: `calc(50% + ${
                        (targetColorInput.length +
                          (targetColorInput.match(/\s/g) || []).length * 0.2) *
                        0.5
                      }rem + 0.01rem)`,
                    }}
                  >
                    <button
                      onClick={() => {
                        animateAutocomplete(suggestedColor);
                      }}
                      className="text-gray-900/60 hover:text-gray-900/80 cursor-pointer font-normal transition-colors duration-200 pr-8 text-build"
                    >
                      {suggestedColor
                        .slice(targetColorInput.length)
                        .toLowerCase()}
                    </button>
                  </span>
                  {/* Clickable area for the right side of the search box when suggestion exists */}
                  {suggestedColor && suggestedColor !== targetColorInput && (
                    <div
                      onClick={() => {
                        animateAutocomplete(suggestedColor);
                      }}
                      className="absolute right-0 top-0 bottom-0 w-2/3 pointer-events-auto"
                      style={{
                        background: "transparent",
                        cursor: "text",
                        zIndex: 0,
                      }}
                    />
                  )}
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
          <div className="relative z-10 mt-10">
            <div className="mb-4 text-sm font-semibold tracking-wide text-blue-700/80">
              Mix Result
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <div
                className="p-4 sm:p-5 rounded-xl shadow-xl border border-white/40 text-lg sm:text-xl font-bold flex items-center justify-center h-20 sm:h-24 min-w-[6rem] transition-transform duration-200 hover:scale-105 relative overflow-hidden group"
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
              <span className="text-xl sm:text-2xl text-gray-800/70">+</span>
              <div
                className="p-4 sm:p-5 rounded-xl shadow-xl border border-white/40 text-lg sm:text-xl font-bold flex items-center justify-center h-20 sm:h-24 min-w-[6rem] transition-transform duration-200 hover:scale-105 relative overflow-hidden group"
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
              <span className="text-xl sm:text-2xl text-gray-800/70">=</span>
              <div
                className="p-4 sm:p-5 rounded-xl shadow-xl ring-1 ring-white/40 text-lg sm:text-xl font-extrabold flex items-center justify-center h-20 sm:h-24 min-w-[7rem] transition-transform duration-200 hover:scale-105 relative overflow-hidden group bg-white/80"
                style={{
                  backgroundColor:
                    colorToHex[targetColorInput.trim().toUpperCase()] ||
                    "#FFFFFF",
                  color:
                    allColorsWithHex.find(
                      (c) => c.name === targetColorInput.trim().toUpperCase()
                    )?.text || "black",
                }}
              >
                {targetColorInput.trim().toUpperCase() || "RESULT"}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
