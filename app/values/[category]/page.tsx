// app/values/[category]/page.tsx
"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../../hooks/useAuth"; // Corrected path
import { useRouter } from "next/navigation";
import FirebaseStorageImage from "../../components/FirebaseStorageImage";
import Cookies from "js-cookie"; // Import Cookies for reading accessCodeRequired
import { useLanguage } from "../../../lib/languageContext";

import {
  RefreshCcw,
  Car,
  Ship,
  Plane,
  Shirt,
  Scissors,
  Package,
  Glasses, // Ensure Glasses is imported if used for masks
} from "lucide-react";

// Utility to format slugs into readable titles
const formatSlug = (slug: string) =>
  slug
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());

interface GRPValuesItem {
  name: string;
  value: string;
  sheetName: string;
  imageUrl?: string;
}

// Mask categories & icons
const maskCategories = [
  {
    slug: "desertscarfmask",
    name: "Desert Scarf Masks",
    iconPath: "/images/desert_scarf.png",
  },
  {
    slug: "bandanamask",
    name: "Bandana Masks",
    iconPath: "/images/bandana_mask.png",
  },
  {
    slug: "tightmask",
    name: "Tight Masks",
    iconPath: "/images/tight_mask.png",
  },
  {
    slug: "snowboardermask",
    name: "Snowboarder Masks",
    iconPath: "/images/snowboarder_mask.png",
  },
];

// Clothing subcategories
const allClothingSubcategories = [
  { display: "Accessories", slug: "accessory", gender: "men" },
  { display: "Headwear", slug: "headwear_mask", gender: "men" },
  { display: "Tops", slug: "top", gender: "men" },
  { display: "Pants", slug: "pants", gender: "men" },
  { display: "Shoes", slug: "shoes", gender: "men" },
  { display: "Sets", slug: "sets", gender: "men" },
  { display: "Brands", slug: "brand_comparison", gender: "men" },
  { display: "Backpacks", slug: "backpacks", gender: "men" },
  { display: "Watches", slug: "watch", gender: "men" },

  { display: "Accessories", slug: "accessory", gender: "women" },
  { display: "Headwear", slug: "headwear_mask", gender: "women" },
  { display: "Tops", slug: "top", gender: "women" },
  { display: "Pants", slug: "pants", gender: "women" },
  { display: "Shoes", slug: "shoes", gender: "women" },
  { display: "Sets", slug: "sets", gender: "women" },
  { display: "Brands", slug: "brand_comparison", gender: "women" },
  { display: "Backpacks", slug: "backpacks", gender: "women" },
  { display: "Watches", slug: "watch", gender: "women" },
];

const extractExtraNumber = (item: GRPValuesItem): number => {
  const match = item.name.match(/Extra\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : 1000;
};

// Mapping API slugs to display names
const specialCategoryNames: Record<string, string> = {
  clothinglist: "Clothing List",
  vehicleslist: "Vehicles List", // Assuming vehicleslist exists in your Header or somewhere else
  lumitshirt: "Luminous Shirts", // Kept for backward compatibility if needed, though now "luminousclothing" is primary
  lumipants: "Luminous Pants", // Kept for backward compatibility if needed
  luminousclothing: "Luminous Clothing", // NEW: Merged category
  illegalitems: "Illegal Items",
  denimjacket: "Denim Jackets",
  croppcollectionshirt: "Cropped Collection Shirts",
  desertscarfmask: "Desert Scarf Masks",
  bandanamask: "Bandana Masks",
  tightmask: "Tight Masks",
  snowboardermask: "Snowboarder Masks",
  motorcycles: "Motorcycles",
  items: "Items",
};

/**
 * Parses a currency string into a number, handling various thousands/decimal separators.
 * This function prioritizes decimal detection and then removes thousands separators.
 * @param value The currency string (e.g., "1.000.000", "1,000,000", "1,234.56", "1.234,56").
 * @returns The parsed number, or 0 if parsing fails.
 */
const parseValueToNumber = (value: string): number => {
  if (!value) return 0;

  let cleaned = value.trim();

  // Step 1: Remove any non-digit, non-dot, non-comma character
  cleaned = cleaned.replace(/[^0-9.,]/g, "");

  const dotCount = (cleaned.match(/\./g) || []).length;
  const commaCount = (cleaned.match(/,/g) || []).length;
  const lastDotIndex = cleaned.lastIndexOf(".");
  const lastCommaIndex = cleaned.lastIndexOf(",");

  let numberToParse = cleaned;

  // Case 1: European format (thousands with dots, decimal with comma e.g., "1.234.567,89")
  if (commaCount === 1 && dotCount >= 1 && lastCommaIndex > lastDotIndex) {
    numberToParse = numberToParse.replace(/\./g, "").replace(",", ".");
  }
  // Case 2: American format (thousands with commas, decimal with dot e.g., "1,234,567.89")
  else if (dotCount === 1 && commaCount >= 1 && lastDotIndex > lastCommaIndex) {
    numberToParse = numberToParse.replace(/,/g, "");
  }
  // Case 3: Only dots or only commas, need to determine if it's thousands or decimal
  else if (dotCount > 0 && commaCount === 0) {
    // Only dots present
    // If only one dot and followed by 1 or 2 digits, assume decimal (e.g., "1.23")
    if (dotCount === 1 && /\.\d{1,2}$/.test(cleaned)) {
      // Keep as is, it's already parseFloat compatible for decimal
    } else {
      // Assume dots are thousands separators (e.g., "1.000.000")
      numberToParse = numberToParse.replace(/\./g, "");
    }
  } else if (commaCount > 0 && dotCount === 0) {
    // Only commas present
    // If only one comma and followed by 1 or 2 digits, assume decimal (e.g., "1,23")
    if (commaCount === 1 && /,\d{1,2}$/.test(cleaned)) {
      numberToParse = numberToParse.replace(",", "."); // Convert to dot decimal for parseFloat
    } else {
      // Assume commas are thousands separators (e.g., "1,000,000")
      numberToParse = numberToParse.replace(/,/g, "");
    }
  }
  // Case 4: No separators, already a plain number string.

  const parsed = parseFloat(numberToParse);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Formats a number with commas as thousands separators.
 * @param num The number or string representing a number.
 * @returns A formatted string (e.g., "1,234,567"). Returns original if invalid.
 */
const formatNumberWithCommas = (num: number | string): string => {
  const number = typeof num === "string" ? parseValueToNumber(num) : num;
  if (typeof number !== "number" || isNaN(number)) {
    return String(num); // Return original string if it's not a valid number
  }
  return number.toLocaleString("en-US"); // Use 'en-US' locale for comma as thousands separator
};

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const categoryObj = React.use(params);
  const category = categoryObj.category.toLowerCase();

  // Function to get translated category name
  const getTranslatedCategoryName = (categoryName: string) => {
    const categoryMap: { [key: string]: string } = {
      'cars': 'categories.cars',
      'boats': 'categories.boats',
      'planes': 'categories.planes',
      'helicopters': 'categories.helicopters',
      'motorcycles': 'categories.motorcycles',
      'items': 'categories.items',
      'clothinglist': 'categories.clothing_list',
      'masks': 'categories.masks',
      'luminousclothing': 'categories.luminous_clothing',
      'illegalitems': 'categories.illegal_items',
      'croppcollectionshirt': 'categories.cropped_collection_shirts',
      'denimjacket': 'categories.denim_jackets',
    };
    
    const translationKey = categoryMap[categoryName.toLowerCase()];
    return translationKey ? t(translationKey) : formatSlug(categoryName);
  };

  // Redirect old bunkerhelp route to new bunker-help page
  React.useEffect(() => {
    if (category === "bunkerhelp") {
      router.replace("/bunker-help");
    }
  }, [category, router]);

  const [selectedMainCategory, setSelectedMainCategory] = useState(
    category === "masks" ? "desertscarfmask" : category
  );
  const [selectedGender, setSelectedGender] = useState<"men" | "women" | null>(
    null
  );
  const [selectedClothingSubcatSlug, setSelectedClothingSubcatSlug] = useState<
    string | null
  >(null);
  // NEW STATE for luminous clothing subcategories
  const [selectedLuminousSubcategory, setSelectedLuminousSubcategory] =
    useState<"shirts" | "pants" | null>(null);

  const [items, setItems] = useState<GRPValuesItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestedItem, setSuggestedItem] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [sortOption, setSortOption] = useState<
    "value-asc" | "value-desc" | "alpha-asc" | "alpha-desc" | null
  >(null);
  const [hideValueField, setHideValueField] = useState(false);

  // Fetch value visibility setting
  const fetchValueVisibility = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/value-visibility");
      if (response.ok) {
        const data = await response.json();
        setHideValueField(data.hideValueField);
      }
    } catch (error) {
      console.error("Error fetching value visibility setting:", error);
    }
  }, []);

  const fetchClothingItems = useCallback(
    async (gender: string, heading: string | null) => {
      if (!heading) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const fetchGender =
          heading === "backpacks" && gender === "women" ? "men" : gender;
        const res = await fetch(
          `/api/values/clothinglist?gender=${fetchGender}&heading=${heading}`
        );
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
        }
        const data: GRPValuesItem[] = await res.json();
        setItems(
          data.sort((a, b) => extractExtraNumber(a) - extractExtraNumber(b))
        );
      } catch (e: any) {
        console.error("Error fetching clothing items:", e);
        setError(
          `Failed to load clothing items: ${e.message || "Unknown error"}`
        );
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchGeneralItems = useCallback(async () => {
    if (!selectedMainCategory) return;
    setLoading(true);
    setError(null);
    try {
      const apiSlug = selectedMainCategory;

      const res = await fetch(`/api/values/${apiSlug}`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
      }
      const data: GRPValuesItem[] = await res.json();

      let sorted = data;
      if (selectedMainCategory === "desertscarfmask") {
        const luiViItems = data
          .filter((i) => /lui vi/i.test(i.name))
          .sort((a, b) => extractExtraNumber(a) - extractExtraNumber(b));
        const normalItems = data
          .filter((i) => !/lui vi/i.test(i.name))
          .sort((a, b) => extractExtraNumber(a) - extractExtraNumber(b));
        sorted = [...luiViItems, ...normalItems];
      } else {
        sorted = data.sort(
          (a, b) => extractExtraNumber(a) - extractExtraNumber(b)
        );
      }
      setItems(sorted);
    } catch (e: any) {
      console.error("Error fetching general items:", e);
      setError(
        `Values for ${
          specialCategoryNames[selectedMainCategory] ||
          formatSlug(selectedMainCategory)
        } are currently being fixed. Error: ${e.message || "Unknown error"}`
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMainCategory]);

  // NEW: Fetch function for luminous clothing
  const fetchLuminousItems = useCallback(async (type: "shirts" | "pants") => {
    setLoading(true);
    setError(null);
    try {
      // The API endpoint for luminous clothing will need to be created/updated
      // to handle the 'type' parameter and fetch data for shirts or pants.
      const res = await fetch(`/api/values/luminousclothing?type=${type}`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
      }
      const data: GRPValuesItem[] = await res.json();
      setItems(
        data.sort((a, b) => extractExtraNumber(a) - extractExtraNumber(b))
      );
    } catch (e: any) {
      console.error("Error fetching luminous items:", e);
      setError(
        `Failed to load luminous clothing: ${e.message || "Unknown error"}`
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    const filtered = items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (!sortOption) return filtered;
    const copy = [...filtered];
    switch (sortOption) {
      case "value-asc":
        return copy.sort(
          (a, b) => parseValueToNumber(a.value) - parseValueToNumber(b.value)
        );
      case "value-desc":
        return copy.sort(
          (a, b) => parseValueToNumber(b.value) - parseValueToNumber(a.value)
        );
      case "alpha-asc":
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case "alpha-desc":
        return copy.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return copy;
    }
  }, [items, searchTerm, sortOption]);

  // Autocomplete logic for search suggestions
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestedItem("");
      return;
    }

    const input = searchTerm.trim().toLowerCase();
    const suggestion = items.find((item) =>
      item.name.toLowerCase().startsWith(input)
    );

    if (suggestion && suggestion.name.toLowerCase() !== input) {
      setSuggestedItem(suggestion.name);
    } else {
      setSuggestedItem("");
    }
  }, [searchTerm, items]);

  const clothingHeadingsForDisplay = useMemo(
    () =>
      selectedGender
        ? allClothingSubcategories.filter(
            (subcat) => subcat.gender === selectedGender
          )
        : [],
    [selectedGender]
  );

  // Main useEffect to manage category changes and reset states
  useEffect(() => {
    if (category === "masks") {
      setSelectedMainCategory("desertscarfmask");
      setSelectedGender(null);
      setSelectedClothingSubcatSlug(null);
      setSelectedLuminousSubcategory(null); // Reset for other categories
    } else if (category === "clothinglist") {
      setSelectedMainCategory(category);
      setSelectedLuminousSubcategory(null); // Reset for other categories
      // Keep selectedGender and selectedClothingSubcatSlug if they exist
    } else if (category === "luminousclothing") {
      // Handle new luminousclothing category
      setSelectedMainCategory(category);
      setSelectedGender(null);
      setSelectedClothingSubcatSlug(null);
      if (!selectedLuminousSubcategory) {
        // Set default luminous subcategory if not already set
        setSelectedLuminousSubcategory("shirts");
      }
    } else {
      // Generic category
      setSelectedMainCategory(category);
      setSelectedGender(null);
      setSelectedClothingSubcatSlug(null);
      setSelectedLuminousSubcategory(null); // Reset for other categories
    }
    setItems([]);
    setSearchTerm("");
    setSortOption(null);
    
    // Fetch value visibility setting
    fetchValueVisibility();
  }, [category, fetchValueVisibility]);

  // useEffect to trigger data fetching based on selected states
  useEffect(() => {
    if (category === "clothinglist") {
      if (selectedGender && selectedClothingSubcatSlug) {
        fetchClothingItems(selectedGender, selectedClothingSubcatSlug);
      } else {
        setItems([]);
        setLoading(false);
      }
    } else if (category === "luminousclothing") {
      // NEW: Logic for luminous clothing fetching
      if (selectedLuminousSubcategory) {
        fetchLuminousItems(selectedLuminousSubcategory);
      } else {
        setItems([]);
        setLoading(false);
      }
    } else {
      if (category === "masks" && !selectedMainCategory) {
        setSelectedMainCategory("desertscarfmask");
      }
      if (selectedMainCategory) {
        fetchGeneralItems();
      }
    }
  }, [
    category,
    selectedMainCategory,
    selectedGender,
    selectedClothingSubcatSlug,
    selectedLuminousSubcategory, // NEW: Add this dependency
    fetchClothingItems,
    fetchGeneralItems,
    fetchLuminousItems, // NEW: Add this dependency
  ]);

  // Autocomplete logic for search suggestions
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestedItem("");
      return;
    }

    const input = searchTerm.trim().toLowerCase();
    const suggestion = items.find(
      (item) =>
        item.name.toLowerCase().startsWith(input) ||
        item.name.toLowerCase().includes(input)
    );

    if (suggestion && suggestion.name.toLowerCase() !== input) {
      setSuggestedItem(suggestion.name);
    } else {
      setSuggestedItem("");
    }
  }, [searchTerm, items]);

  // Animation function for autocomplete
  const animateAutocomplete = (newValue: string) => {
    setIsAnimating(true);

    // Animate text building by gradually revealing characters
    const currentText = searchTerm;
    const newText = newValue;
    const charsToAdd = newText.slice(currentText.length);

    if (charsToAdd.length > 0) {
      let currentIndex = currentText.length;
      const interval = setInterval(() => {
        if (currentIndex < newText.length) {
          setSearchTerm(newText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(interval);
          setSuggestedItem(""); // Clear suggestion after animation
          setTimeout(() => setIsAnimating(false), 100);
        }
      }, 50); // 50ms delay between each character
    } else {
      setSearchTerm(newText);
      setSuggestedItem("");
      setTimeout(() => setIsAnimating(false), 100);
    }
  };

  // Now, the conditional returns come after all hooks are declared.

  // Show a loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-7xl mx-auto px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
        <p className="text-gray-300">Loading content...</p>
      </div>
    );
  }

  // Since access codes are no longer required, we can proceed with rendering
  // The page is now fully public

  // Header icon - This is a helper function, not a hook. Its position is flexible.
  const getHeaderIcon = (slug: string) => {
    const mask = maskCategories.find((m) => m.slug === slug);
    if (mask)
      return (
        <div className="w-32 h-32 flex items-center justify-center rounded-full bg-gray-700 p-2">
          <img
            src={mask.iconPath}
            className="w-full h-full object-contain"
            alt={mask.name}
          />
        </div>
      );
    switch (slug) {
      case "cars":
        return <Car className="w-16 h-16" />;
      case "boats":
        return <Ship className="w-16 h-16" />;
      case "planes":
      case "helicopters":
        return <Plane className="w-16 h-16" />;
      case "clothinglist":
        return <Shirt className="w-16 h-16" />;
      case "lumitshirt": // Kept for individual category handling if needed
      case "lumipants": // Kept for individual category handling if needed
      case "luminousclothing": // NEW: Icon for the merged category
        return <Shirt className="w-16 h-16" />; // Using Shirt as a generic luminous icon
      case "denimjacket":
        return <Shirt className="w-16 h-16" />;
      case "croppcollectionshirt":
        return <Shirt className="w-16 h-16" />;
      case "illegalitems":
        return <Package className="w-16 h-16" />;
      case "motorcycles":
        return <Car className="w-16 h-16 -scale-x-100" />;

      case "items":
        return <Package className="w-16 h-16" />;
      default:
        return <RefreshCcw className="w-16 h-16" />;
    }
  };

  // Determine current header name - This is a regular variable assignment.
  const currentHeaderName = getTranslatedCategoryName(selectedMainCategory);
  const currentHeaderIconSlug = selectedMainCategory;

  const getSortButtonClass = (option: typeof sortOption) => `
    px-4 py-2 rounded-lg font-semibold transition
    ${
      sortOption === option
        ? "bg-blue-600 text-white shadow-lg transform scale-105"
        : "bg-gray-700 text-gray-200 hover:bg-blue-600 hover:text-white"
    }
  `;

  return (
    <div className="flex flex-col items-center mt-8 px-4 sm:px-8 pb-8">
      {/* Main Header */}
      <h1 className="relative flex flex-col items-center justify-center text-5xl font-extrabold text-blue-400 mb-12 drop-shadow-lg text-center">
        {getHeaderIcon(currentHeaderIconSlug)}
        <span className="inline-block mt-4 capitalize">
          {currentHeaderName}
        </span>
      </h1>

      {/* Masks Buttons */}
      {category === "masks" && (
        <div className="flex flex-col items-center w-full max-w-6xl mb-8">
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            {maskCategories.map((mask) => (
              <button
                key={mask.slug}
                onClick={() => {
                  if (selectedMainCategory === mask.slug) return;
                  setSelectedMainCategory(mask.slug);
                  setSelectedGender(null);
                  setSelectedClothingSubcatSlug(null);
                  setSelectedLuminousSubcategory(null); // Reset
                  setItems([]);
                  setSearchTerm("");
                  setSortOption(null);
                  setLoading(true);
                }}
                className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  selectedMainCategory === mask.slug
                    ? "bg-blue-600 text-white shadow-lg transform scale-105"
                    : "bg-gray-700 text-gray-200 hover:bg-blue-600 hover:text-white"
                }`}
              >
                {mask.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Luminous Clothing Buttons (NEW) */}
      {category === "luminousclothing" && (
        <div className="flex flex-col items-center w-full max-w-6xl mb-8">
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <button
              onClick={() => {
                if (selectedLuminousSubcategory === "shirts") return;
                setSelectedLuminousSubcategory("shirts");
                setItems([]); // Clear items to show loading state
                setSearchTerm("");
                setSortOption(null);
                setLoading(true); // Indicate loading for new fetch
              }}
              className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 ${
                selectedLuminousSubcategory === "shirts"
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-700 text-gray-200 hover:bg-blue-600 hover:text-white"
              }`}
            >
              Shirts
            </button>
            <button
              onClick={() => {
                if (selectedLuminousSubcategory === "pants") return;
                setSelectedLuminousSubcategory("pants");
                setItems([]); // Clear items to show loading state
                setSearchTerm("");
                setSortOption(null);
                setLoading(true); // Indicate loading for new fetch
              }}
              className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 ${
                selectedLuminousSubcategory === "pants"
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-700 text-gray-200 hover:bg-blue-600 hover:text-white"
              }`}
            >
              Pants
            </button>
          </div>
        </div>
      )}

      {/* Clothing List Navigation */}
      {category === "clothinglist" && (
        <>
          {!selectedGender && (
            <div className="flex justify-center items-center gap-8 mb-12">
              <button
                onClick={() => {
                  setSelectedGender("men");
                  setSelectedClothingSubcatSlug(null);
                  setSelectedLuminousSubcategory(null); // Reset
                  setItems([]);
                  setSearchTerm("");
                  setSortOption(null);
                }}
                className="w-48 px-8 py-6 text-2xl font-bold rounded-3xl bg-blue-600 text-white shadow-lg hover:scale-105 transition text-center"
              >
                Men
              </button>
              <button
                onClick={() => {
                  setSelectedGender("women");
                  setSelectedClothingSubcatSlug(null);
                  setSelectedLuminousSubcategory(null); // Reset
                  setItems([]);
                  setSearchTerm("");
                  setSortOption(null);
                }}
                className="w-48 px-8 py-6 text-2xl font-bold rounded-3xl bg-pink-600 text-white shadow-lg hover:scale-105 transition text-center"
              >
                Women
              </button>
            </div>
          )}

          {selectedGender && (
            <div className="flex flex-col items-center w-full">
              {selectedClothingSubcatSlug && (
                <button
                  onClick={() => {
                    setSelectedClothingSubcatSlug(null);
                    setItems([]);
                    setSearchTerm("");
                    setSortOption(null);
                  }}
                  className="mb-6 px-5 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors duration-200"
                >
                  ← Back to Subcategories
                </button>
              )}
              {!selectedClothingSubcatSlug && (
                <button
                  onClick={() => {
                    setSelectedGender(null);
                    setSelectedClothingSubcatSlug(null);
                    setItems([]);
                    setSearchTerm("");
                    setSortOption(null);
                  }}
                  className="mb-6 px-5 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors duration-200"
                >
                  ← Back to Gender Selection
                </button>
              )}

              {!selectedClothingSubcatSlug && (
                <div className="flex flex-wrap justify-center gap-4 mb-10 p-6 bg-gray-800 rounded-2xl shadow-xl border border-gray-700 w-full max-w-3xl">
                  {clothingHeadingsForDisplay.map((subcat) => (
                    <button
                      key={subcat.slug}
                      onClick={() => {
                        setSelectedClothingSubcatSlug(subcat.slug);
                        setItems([]);
                        setSearchTerm("");
                        setSortOption(null);
                        setLoading(true);
                      }}
                      className={`px-7 py-3 rounded-xl text-lg font-semibold transition-all duration-300 ${
                        selectedClothingSubcatSlug === subcat.slug
                          ? "bg-blue-600 text-white shadow-lg transform scale-105"
                          : "bg-gray-700 text-gray-200 hover:bg-blue-600 hover:scale-105"
                      }`}
                    >
                      {subcat.display === "Headwear"
                        ? "Headwear/Masks"
                        : subcat.display}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Search & Sort */}
      {!loading &&
        !error &&
        (category !== "clothinglist" ||
          (selectedGender && selectedClothingSubcatSlug)) &&
        (category !== "luminousclothing" || selectedLuminousSubcategory) && ( // NEW: Added condition for luminous clothing
          <div className="flex flex-col items-center w-full max-w-6xl mb-8">
            <div className="relative w-full max-w-md mb-4">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-5 py-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  isAnimating ? "bg-green-800 border-green-500" : ""
                }`}
              />

              {/* Clickable autocomplete helper positioned after user's text */}
              {suggestedItem && suggestedItem !== searchTerm && (
                <div className="absolute inset-0 flex items-center pointer-events-none">
                  <span
                    className="text-gray-100 font-normal absolute pointer-events-auto"
                    style={{
                      left: `calc(1.25rem + ${
                        (searchTerm.length +
                          (searchTerm.match(/\s/g) || []).length * 0.2) *
                        0.5
                      }rem + 0.01rem)`,
                    }}
                  >
                    <button
                      onClick={() => {
                        animateAutocomplete(suggestedItem);
                      }}
                      className="text-gray-400/70 hover:text-gray-300 cursor-pointer font-normal transition-colors duration-200 pr-8 text-build"
                    >
                      {suggestedItem.slice(searchTerm.length).toLowerCase()}
                    </button>
                  </span>
                  {/* Clickable area for the right side of the search box when suggestion exists */}
                  {suggestedItem && suggestedItem !== searchTerm && (
                    <div
                      onClick={() => {
                        animateAutocomplete(suggestedItem);
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
            <div className="flex gap-4 flex-wrap justify-center mb-6">
              <button
                className={getSortButtonClass("value-asc")}
                onClick={() => setSortOption("value-asc")}
              >
                Value ↑
              </button>
              <button
                className={getSortButtonClass("value-desc")}
                onClick={() => setSortOption("value-desc")}
              >
                Value ↓
              </button>
              <button
                className={getSortButtonClass("alpha-asc")}
                onClick={() => setSortOption("alpha-asc")}
              >
                A-Z
              </button>
              <button
                className={getSortButtonClass("alpha-desc")}
                onClick={() => setSortOption("alpha-desc")}
              >
                Z-A
              </button>
            </div>
          </div>
        )}

      {/* Items Grid */}
      {loading && <div className="text-center text-gray-400">Loading...</div>}
      {error && (
        <div className="text-center text-white font-semibold">
          Values for {currentHeaderName} are currently being fixed. Error:{" "}
          <span className="text-red-400">{error}</span>
        </div>
      )}
      {!loading &&
        filteredAndSortedItems.length === 0 &&
        !error &&
        (category !== "clothinglist" ||
          (selectedGender && selectedClothingSubcatSlug)) &&
        (category !== "luminousclothing" || selectedLuminousSubcategory) && ( // NEW: Added condition for luminous clothing
          <div className="text-center text-gray-400">
            No items found for {currentHeaderName}.
          </div>
        )}
      {!loading && filteredAndSortedItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
          {filteredAndSortedItems.map((item) => (
            <div
              key={item.name}
              className="bg-gray-800 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-700 text-center flex flex-col items-center"
            >
              {item.imageUrl && (
                <div className="mb-6 flex justify-center items-center w-64 h-64 bg-gray-700 rounded-lg overflow-hidden p-2">
                  <FirebaseStorageImage
                    src={item.imageUrl}
                    alt={item.name}
                    width={256}
                    height={256}
                    className="w-full h-full object-contain"
                    priority={false}
                    fallbackText="Image Not Found"
                  />
                </div>
              )}
              <h3 className="text-2xl font-semibold text-blue-300 mb-2">
                {item.name}
              </h3>
              <p className="text-lg text-gray-200 mt-auto">
                {["cars", "boats", "planes", "helicopters"].includes(
                  category
                ) ? (
                  <>
                    State Value:{" "}
                    <span className="font-bold text-emerald-400">
                      ${formatNumberWithCommas(item.value) || "N/A"}
                    </span>
                  </>
                ) : !hideValueField ? (
                  <>
                    Value:{" "}
                    <span className="font-bold text-emerald-400">
                      {formatNumberWithCommas(item.value) || "N/A"}
                    </span>
                  </>
                ) : null}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
