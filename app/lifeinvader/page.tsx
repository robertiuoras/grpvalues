"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  ClipboardIcon,
  PlusCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon, // Replaced SaveIcon with CheckIcon
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useAuth } from "../../hooks/useAuth"; // Corrected import path for useAuth hook

// Define the interface for a template item
interface Template {
  id?: string; // Add optional id for consistent keying, will be absent for CSVs
  name: string;
  description: string;
  type: string;
  category: string; // The raw extracted category for filtering logic
  displayCategory: string; // The user-friendly category name for display
  normalizedName: string; // Stored for efficient searching
  normalizedDescription: string; // Stored for efficient searching
  normalizedType: string; // Stored for efficient searching
}

// Define interface for user's saved ad
interface UserAd {
  id: string; // Firestore document ID - MUST BE A STRING
  name: string;
  description: string;
  type: string;
  category: string;
  displayCategory: string; // User-friendly category for display
  normalizedName: string;
  normalizedDescription: string;
  normalizedType: string;
  clientId?: string; // The client identifier (IP-based)
  userId?: string; // Legacy field for backward compatibility
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// Official categories for AI assistant (keep the original 8)
const OFFICIAL_CATEGORIES = [
  "auto",
  "work",
  "service",
  "real estate",
  "other",
  "discount",
  "dating",
  "business",
];

// Map category names to their user-friendly display names
const CATEGORY_DISPLAY_NAMES: { [key: string]: string } = {
  "24 7 store": "24/7 Store",
  "ammunition store": "Ammunition Store",
  atm: "ATM",
  bars: "Bars",
  "car sharing": "Car Sharing",
  "chip tuning": "Chip Tuning",
  "car wash": "Car Wash",
  "clothing store": "Clothing Store",
  "electrical station": "Electrical Station",
  family: "Family",
  farm: "Farm",
  "gas station": "Gas Station",
  "hair salon": "Hair Salon",
  "jewellery store": "Jewellery Store",
  "juice shop": "Juice Shop",
  "law firm": "Law Firm",
  "misc/own business": "Misc/Own Business",
  office: "Office",
  "oil well": "Oil Well",
  organisation: "Organisation",
  parking: "Parking",
  "pet shop": "Pet Shop",
  "service station": "Service Station",
  "tattoo parlor": "Tattoo Parlor",
  "taxi cab": "Taxi Cab",
  warehouse: "Warehouse",
  // AI Assistant categories (for backward compatibility)
  auto: "Auto",
  work: "Work",
  service: "Service",
  "real estate": "Real Estate",
  other: "Other",
  discount: "Discount",
  dating: "Dating",
  business: "Business",
};

// Map categories to their icon files (matching the icons in public/images/icons)
const CATEGORY_ICONS: { [key: string]: string } = {
  "24 7 store": "/images/icons/business.png",
  "ammunition store": "/images/icons/business.png",
  atm: "/images/icons/business.png",
  bars: "/images/icons/business.png",
  "car sharing": "/images/icons/auto.png",
  "chip tuning": "/images/icons/auto.png",
  "car wash": "/images/icons/service.png",
  "clothing store": "/images/icons/other.png",
  "electrical station": "/images/icons/service.png",
  family: "/images/icons/dating.png",
  farm: "/images/icons/business.png",
  "gas station": "/images/icons/service.png",
  "hair salon": "/images/icons/service.png",
  "jewellery store": "/images/icons/other.png",
  "juice shop": "/images/icons/business.png",
  "law firm": "/images/icons/work.png",
  "misc/own business": "/images/icons/business.png",
  office: "/images/icons/work.png",
  "oil well": "/images/icons/business.png",
  organisation: "/images/icons/business.png",
  parking: "/images/icons/service.png",
  "pet shop": "/images/icons/business.png",
  "service station": "/images/icons/service.png",
  "tattoo parlor": "/images/icons/service.png",
  "taxi cab": "/images/icons/auto.png",
  warehouse: "/images/icons/business.png",
  // AI Assistant categories (for backward compatibility)
  auto: "/images/icons/auto.png",
  work: "/images/icons/work.png",
  service: "/images/icons/service.png",
  "real estate": "/images/icons/real estate.png",
  other: "/images/icons/other.png",
  discount: "/images/icons/discount.png",
  dating: "/images/icons/dating.png",
  business: "/images/icons/business.png",
};

// Helper function to extract ad content and category from AI response
const extractAdContentAndCategory = (aiResponse: string) => {
  const lines = aiResponse.split("\n");

  // Find the category line (should be the last line)
  const categoryLine = lines[lines.length - 1];
  const categoryMatch = categoryLine?.match(/Category:\s*(.+)/);

  if (categoryMatch) {
    // If we found a category line, exclude it from the ad content
    const adContent = lines.slice(0, -1).join("\n").trim();
    let category = categoryMatch[1].trim();

    // Map "misc/own business" to "business" for display
    if (category === "misc/own business") {
      category = "business";
    }

    return { adContent, category };
  } else {
    // If no category line found, treat the entire response as ad content
    const adContent = aiResponse.trim();
    return { adContent, category: "" };
  }
};

// Helper function to get category icon
const getCategoryIcon = (category: string) => {
  const lowerCategory = category.toLowerCase();

  // Direct matches
  if (CATEGORY_ICONS[lowerCategory]) {
    return CATEGORY_ICONS[lowerCategory];
  }

  // Partial matches
  if (
    lowerCategory.includes("auto") ||
    lowerCategory.includes("car") ||
    lowerCategory.includes("vehicle")
  ) {
    return CATEGORY_ICONS.auto;
  }
  if (lowerCategory.includes("clothing") || lowerCategory.includes("fashion")) {
    return CATEGORY_ICONS["clothing store"];
  }
  if (
    lowerCategory.includes("office") ||
    lowerCategory.includes("work") ||
    lowerCategory.includes("job")
  ) {
    return CATEGORY_ICONS.office;
  }
  if (lowerCategory.includes("service")) {
    return CATEGORY_ICONS["service station"];
  }
  if (lowerCategory.includes("business") || lowerCategory.includes("misc")) {
    return CATEGORY_ICONS["misc/own business"];
  }

  return CATEGORY_ICONS.default;
};

// Map canonical category names to their respective Google Sheet published CSV URLs.
// YOU WILL NEED TO REPLACE PLACEHOLDER URLS WITH YOUR ACTUAL PUBLISHED CSV LINKS.
const SHEET_URLS: { [key: string]: string } = {
  "24 7 store":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=81154121&single=true&output=csv",
  "ammunition store":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=536670718&single=true&output=csv",
  atm: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1896199672&single=true&output=csv",
  bars: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=554665436&single=true&output=csv",
  "car sharing":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1677731615&single=true&output=csv",
  "chip tuning":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=2124493753&single=true&output=csv",
  "car wash":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1560289993&single=true&output=csv",
  "clothing store":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1115970352&single=true&output=csv",
  "electrical station":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=890789305&single=true&output=csv",
  family:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=611727212&single=true&output=csv",
  farm: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=693525264&single=true&output=csv",
  "gas station":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1752119158&single=true&output=csv",
  "hair salon":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=313635912&single=true&output=csv",
  "jewellery store":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1913432171&single=true&output=csv",
  "juice shop":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1340443336&single=true&output=csv",
  "law firm":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1563186625&single=true&output=csv",
  "misc/own business":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1861170946&single=true&output=csv",
  office:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=55176013&single=true&output=csv",
  "oil well":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1090149393&single=true&output=csv",
  organisation:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=76653452&single=true&output=csv",
  parking:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1397100388&single=true&output=csv",
  "pet shop":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=120656855&single=true&output=csv",
  "service station":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=488626062&single=true&output=csv",
  "tattoo parlor":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1491755766&single=true&output=csv",
  "taxi cab":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1643962212&single=true&output=csv",
  warehouse:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=366962962&single=true&output=csv",
};

// All available categories from SHEET_URLS for LifeInvader templates
const ALL_TEMPLATE_CATEGORIES = Object.keys(SHEET_URLS);

// Helper function to get the canonical category from a display name
const getCanonicalCategory = (displayName: string): string => {
  for (const key in CATEGORY_DISPLAY_NAMES) {
    if (CATEGORY_DISPLAY_NAMES[key] === displayName) {
      return key;
    }
  }
  return "uncategorized"; // Fallback for unmatched display names
};

// Helper function to get icon paths for different types
const getTypeIcon = (type: string): string => {
  if (!type) return "/images/icons/other.png";

  const lowerType = type.toLowerCase();

  // Match types to your custom icon files
  if (lowerType.includes("work") || lowerType.includes("office"))
    return "/images/icons/work.png";
  if (lowerType.includes("business") || lowerType.includes("misc"))
    return "/images/icons/business.png";
  if (
    lowerType.includes("auto") ||
    lowerType.includes("car") ||
    lowerType.includes("vehicle")
  )
    return "/images/icons/auto.png";
  if (lowerType.includes("service") || lowerType.includes("station"))
    return "/images/icons/service.png";
  if (lowerType.includes("real estate") || lowerType.includes("property"))
    return "/images/icons/real estate.png";
  if (lowerType.includes("dating") || lowerType.includes("social"))
    return "/images/icons/dating.png";
  if (lowerType.includes("discount") || lowerType.includes("sale"))
    return "/images/icons/discount.png";

  // Default fallback
  return "/images/icons/other.png";
};

/**
 * Normalizes text for search, converting to lowercase, removing punctuation,
 * and replacing common synonyms/abbreviations. It also handles numbers.
 * @param text The input string to normalize.
 * @returns The normalized string.
 */
const normalizeSearchText = (text: string): string => {
  if (!text) return "";
  let normalized = text.toLowerCase();

  const TEMPLATE_PLACEHOLDER = "__UNIQUE_TEMPLATE_PLACEHOLDER__";

  // Step 1: Apply initial common replacements.
  normalized = normalized.replace(/24\/7/g, "24 7");
  normalized = normalized.replace(/ammo store/g, "ammunition store");
  normalized = normalized.replace(/ammo/g, "ammunition");
  normalized = normalized.replace(/gun store/g, "ammunition store");
  normalized = normalized.replace(/gun/g, "ammunition");

  // Step 2: Protect existing "template" words from being affected by the "temp" rule.
  // Replace the full word "template" with a unique placeholder.
  normalized = normalized.replace(/\btemplate\b/g, TEMPLATE_PLACEHOLDER);

  // Step 3: Replace "temp" abbreviation with "template".
  // This regex matches "temp" when it's followed by a non-letter character (like space, number, hyphen) or the end of the string.
  // This prevents it from matching "temp" inside "template" (which is now a placeholder).
  // It also handles cases like "temp 2", "temp2".
  normalized = normalized.replace(/\btemp(?=[^a-z]|$)/g, "template");

  // Step 4: Restore the original full "template" words from their placeholders.
  normalized = normalized.replace(
    new RegExp(TEMPLATE_PLACEHOLDER, "g"),
    "template"
  );

  // Step 5: Handle 'n' followed by a number, replacing 'n' and ensuring a space
  normalized = normalized.replace(/\bn\s*(\d+)/g, "$1");

  // Step 6: Replace any sequence of non-alphanumeric characters (including hyphens, underscores, etc.)
  // with a single space. This also effectively separates "word123" into "word 123" by replacing
  // the non-alphanumeric boundary that implicitly exists.
  normalized = normalized.replace(/[^a-z0-9]+/g, " ");

  // Step 7: Consolidate multiple spaces to a single space and final trim
  return normalized.replace(/\s+/g, " ").trim();
};

/**
 * Helper function to extract a raw category string from the template name.
 * This function attempts to match the template name with predefined sheet categories.
 * @param name The full name of the template from the first CSV column.
 * @returns A raw string representing the category.
 */
const getCategoryFromName = (name: string): string => {
  if (!name) return "uncategorized";

  const lowerCaseName = name.toLowerCase();

  // Try to match against the predefined OFFICIAL_CATEGORIES
  for (const sheetCat of OFFICIAL_CATEGORIES) {
    if (lowerCaseName.startsWith(sheetCat)) {
      return sheetCat;
    }
    // Specific adjustment for "24 7 n X" if it appears in the name, map to "24 7 store"
    if (sheetCat === "24 7 store" && lowerCaseName.startsWith("24 7 n")) {
      return "24 7 store";
    }
  }

  // Fallback to simpler parsing if no exact match is found.
  const partsByDash = lowerCaseName.split(" - ");
  if (partsByDash.length > 1) return partsByDash[0].trim();

  const partsByTemplate = lowerCaseName.split(" template ");
  if (partsByTemplate.length > 1) return partsByTemplate[0].trim();

  const partsByN = lowerCaseName.split(" n ");
  if (partsByN.length > 1) {
    const potentialCategory = partsByN[0].trim();
    if (potentialCategory.split(" ").length <= 2) {
      return potentialCategory;
    }
  }

  const words = lowerCaseName.split(" ");
  if (
    words.length >= 2 &&
    (words[1] === "store" ||
      words[1] === "shop" ||
      words[1] === "station" ||
      words[1] === "location" ||
      words[1] === "access" ||
      words[1] === "parlor")
  ) {
    return `${words[0]} ${words[1]}`;
  }

  return words[0].trim();
};

/**
 * Helper function to format the raw category name into a user-friendly display string.
 * @param category The raw category string extracted or canonical category.
 * @returns A formatted string for UI display.
 */
const formatCategoryDisplayName = (category: string): string => {
  // Use the predefined display names if available
  if (CATEGORY_DISPLAY_NAMES[category]) {
    return CATEGORY_DISPLAY_NAMES[category];
  }
  // Otherwise, title-case it as a fallback
  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Custom Confirmation/Alert Modal Component
interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirm: boolean; // true for confirm, false for alert
  title?: string;
}

// MOVED: ConfirmationModal component definition moved outside the App component
const ConfirmationModal: React.FC<
  ConfirmationModalProps & { isDarkMode?: boolean }
> = ({
  message,
  onConfirm,
  onCancel,
  isConfirm,
  title,
  isDarkMode = false,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100]">
      <div
        className={`rounded-xl shadow-2xl p-8 max-w-sm w-full relative text-center transition-colors duration-300 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2
          className={`text-xl font-bold mb-4 ${
            isDarkMode ? "text-gray-100" : "text-gray-800"
          }`}
        >
          {title || (isConfirm ? "Confirm Action" : "Notice")}
        </h2>
        <p className={`mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
          {message}
        </p>
        <div className="flex justify-center gap-4">
          {isConfirm && (
            <button
              onClick={onConfirm}
              className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors duration-200"
            >
              Confirm
            </button>
          )}
          <button
            onClick={onCancel}
            className={`px-6 py-2 rounded-lg ${
              isConfirm
                ? isDarkMode
                  ? "bg-gray-600 hover:bg-gray-500 text-gray-200"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } font-semibold transition-colors duration-200`}
          >
            {isConfirm ? "Cancel" : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to get the text content for an ad card for display and copying
const getAdDisplayContent = (ad: Template | UserAd): string => {
  const description = ad.description ?? "";
  return description; // Only return description text
};

/**
 * The main application component for Lifeinvader templates.
 * Fetches data from a Google Sheet, categorizes it, and provides search and filter functionality.
 */
export default function App() {
  const { isAuthenticated, userId, isLoading: authLoading } = useAuth(); // Get auth state and userId
  // LOG: Initial state of auth variables
  console.log(
    "App Component Render: authLoading:",
    authLoading,
    "isAuthenticated:",
    isAuthenticated,
    "userId:",
    userId
  );

  // Fetch last sync time on component mount
  useEffect(() => {
    const fetchLastSyncTime = async () => {
      try {
        const response = await fetch('/api/last-sync');
        const data = await response.json();
        if (data.success && data.lastSyncTime) {
          const syncDate = new Date(data.lastSyncTime);
          const localTime = syncDate.toLocaleString();
          setLastSyncTime(localTime);
        }
      } catch (error) {
        console.error('Error fetching last sync time:', error);
        // Set a fallback time
        setLastSyncTime(new Date().toLocaleString());
      }
    };

    fetchLastSyncTime();
  }, []);

  const [mainTitle, setMainTitle] = useState("LifeInvader Templates"); // New state for main title
  const [templates, setTemplates] = useState<Template[]>([]);
  const [allFetchedTemplates, setAllFetchedTemplates] = useState<Template[]>(
    []
  );
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [categories, setCategories] = useState<string[]>(
    ALL_TEMPLATE_CATEGORIES.map(formatCategoryDisplayName)
  );
  const [activeCategory, setActiveCategory] = useState(
    ALL_TEMPLATE_CATEGORIES.length > 0
      ? formatCategoryDisplayName(ALL_TEMPLATE_CATEGORIES[0])
      : ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  // State to hold the debounced search query
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  // State for autocomplete suggestions
  const [suggestedTemplate, setSuggestedTemplate] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true); // Loading for general templates
  const [loadingMyAds, setLoadingMyAds] = useState(false); // NEW: Loading for user ads
  const papaScriptLoaded = useRef(false);

  // Sync-related state variables
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>("");
  const [syncProgress, setSyncProgress] = useState<{
    current: number;
    total: number;
  }>({ current: 0, total: 0 });

  // States for user-saved ads functionality
  const [mySavedAds, setMySavedAds] = useState<UserAd[]>([]);
  const [showMyAds, setShowMyAds] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [currentAdToEdit, setCurrentAdToEdit] = useState<UserAd | null>(null);
  const [newAdName, setNewAdName] = useState("");
  const [newAdDescription, setNewAdDescription] = useState("");
  const [newAdType, setNewAdType] = useState(""); // Kept for data structure, but not in form
  const [newAdCategory, setNewAdCategory] = useState(""); // Kept for data structure, but not in form
  const [adFormError, setAdFormError] = useState("");
  const [adFormLoading, setAdFormLoading] = useState(false);
  const [useLocalStorage, setUseLocalStorage] = useState(false); // Track if using localStorage fallback

  // localStorage helper functions
  const saveToLocalStorage = useCallback((ads: UserAd[]) => {
    try {
      localStorage.setItem('grp-saved-ads', JSON.stringify(ads));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  const loadFromLocalStorage = useCallback((): UserAd[] => {
    try {
      const saved = localStorage.getItem('grp-saved-ads');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  }, []);

  // States for custom modal
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalOnConfirm, setModalOnConfirm] = useState<() => void>(() => {});
  const [modalOnCancel, setModalOnCancel] = useState<() => void>(() => {});
  const [isModalConfirm, setIsModalConfirm] = useState(true);
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [displayLimit, setDisplayLimit] = useState(50); // Limit initial display for performance
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(
    new Set()
  ); // Track expanded descriptions

  // AI Assistant states
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiQuery, setAIQuery] = useState("");
  const [aiResponse, setAIResponse] = useState("");
  const [aiLoading, setAILoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Effect for debouncing the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Reset display limit when search or view changes
  useEffect(() => {
    setDisplayLimit(50);
    setExpandedDescriptions(new Set()); // Reset expanded descriptions
  }, [searchQuery, showMyAds]);

  // Toggle description expansion
  const toggleDescriptionExpansion = (templateId: string) => {
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
      } else {
        newSet.add(templateId);
      }
      return newSet;
    });
  };

  // Fetch user's saved ads
  const fetchMySavedAds = useCallback(async () => {
    console.log("fetchMySavedAds called"); // LOG
    setLoadingMyAds(true); // Use loadingMyAds for user ads
    
    try {
      // Try to fetch from the new saved-ads API first
      const response = await fetch('/api/saved-ads');
      console.log("fetchMySavedAds: API response status:", response.status); // LOG
      
      if (response.ok) {
        const data: UserAd[] = await response.json();
        console.log("fetchMySavedAds: Received data from API:", data); // LOG
        setMySavedAds(data);
        setUseLocalStorage(false);
        
        // Also save to localStorage as backup
        saveToLocalStorage(data);
      } else {
        // If API fails, try localStorage fallback
        console.log("fetchMySavedAds: API failed, trying localStorage fallback");
        const localData = loadFromLocalStorage();
        console.log("fetchMySavedAds: Loaded from localStorage:", localData);
        setMySavedAds(localData);
        setUseLocalStorage(true);
      }
    } catch (error: any) {
      console.error("Error fetching saved ads from API:", error); // LOG
      
      // Try localStorage fallback
      try {
        const localData = loadFromLocalStorage();
        console.log("fetchMySavedAds: Using localStorage fallback:", localData);
        setMySavedAds(localData);
        setUseLocalStorage(true);
      } catch (localError) {
        console.error("Error loading from localStorage:", localError);
        setMySavedAds([]);
        setUseLocalStorage(false);
        
        // Show error modal only if both API and localStorage fail
        setModalMessage("Failed to load your saved ads. Please try again.");
        setIsModalConfirm(false);
        setModalOnCancel(() => () => setShowConfirmationModal(false));
        setModalTitle("Error");
        setShowConfirmationModal(true);
      }
    } finally {
      setLoadingMyAds(false); // Reset loading state
    }
  }, [saveToLocalStorage, loadFromLocalStorage]);

  // Handle adding/editing a user ad
  const handleSaveAd = async () => {
    setAdFormLoading(true);
    setAdFormError("");

    console.log("handleSaveAd: Attempting to save/edit ad."); // LOG

    if (!newAdName || !newAdDescription) {
      // Simplified required fields
      setAdFormError("Ad Name and Description are required.");
      setAdFormLoading(false);
      return;
    }

    // Define default type, category, and displayCategory for user-created ads
    const defaultType = newAdType || "Other";
    const defaultCategory = "misc/own business";
    const defaultDisplayCategory = formatCategoryDisplayName(defaultCategory);

    const payload = {
      name: newAdName,
      description: newAdDescription,
      type: defaultType, // Default type for user-created ads
      category: defaultCategory, // Default category for user-created ads
      displayCategory: defaultDisplayCategory, // FIX: Added displayCategory to payload
      normalizedName: normalizeSearchText(newAdName),
      normalizedDescription: normalizeSearchText(newAdDescription),
      normalizedType: normalizeSearchText(defaultType),
    };

    try {
      const method = currentAdToEdit ? "PUT" : "POST";
      let url = '/api/saved-ads';
      if (currentAdToEdit) {
        // Ensure currentAdToEdit.id is a string and not undefined/null
        if (
          typeof currentAdToEdit.id !== "string" ||
          currentAdToEdit.id === ""
        ) {
          throw new Error("Ad ID for editing is invalid.");
        }
        url = `/api/saved-ads?adId=${currentAdToEdit.id}`;
      }

      console.log(
        "handleSaveAd: Sending payload:",
        payload,
        "to URL:",
        url,
        "with method:",
        method
      ); // LOG
      
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("handleSaveAd: API response status:", response.status); // LOG

      if (response.ok) {
        const responseData = await response.json();
        console.log("handleSaveAd: Raw API response data on success:", responseData); // LOG
        
        // Update localStorage as well
        const updatedAds = currentAdToEdit 
          ? mySavedAds.map(ad => ad.id === currentAdToEdit.id ? responseData : ad)
          : [...mySavedAds, responseData];
        saveToLocalStorage(updatedAds);
        
        await fetchMySavedAds(); // Refresh the list of ads
        setShowAddEditModal(false);
        resetAdForm();
      } else {
        // If API fails, try localStorage fallback
        console.log("handleSaveAd: API failed, using localStorage fallback");
        
        const newAd: UserAd = {
          id: currentAdToEdit?.id || `local_${Date.now()}`,
          ...payload,
          clientId: 'local',
          createdAt: currentAdToEdit?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const updatedAds = currentAdToEdit 
          ? mySavedAds.map(ad => ad.id === currentAdToEdit.id ? newAd : ad)
          : [...mySavedAds, newAd];
        
        setMySavedAds(updatedAds);
        saveToLocalStorage(updatedAds);
        setUseLocalStorage(true);
        
        setShowAddEditModal(false);
        resetAdForm();
      }
    } catch (error: any) {
      console.error("Error saving ad:", error); // LOG
      
      // Try localStorage fallback
      try {
        const newAd: UserAd = {
          id: currentAdToEdit?.id || `local_${Date.now()}`,
          ...payload,
          clientId: 'local',
          createdAt: currentAdToEdit?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const updatedAds = currentAdToEdit 
          ? mySavedAds.map(ad => ad.id === currentAdToEdit.id ? newAd : ad)
          : [...mySavedAds, newAd];
        
        setMySavedAds(updatedAds);
        saveToLocalStorage(updatedAds);
        setUseLocalStorage(true);
        
        setShowAddEditModal(false);
        resetAdForm();
      } catch (localError) {
        setAdFormError("Error saving ad. Please try again.");
        console.error("Error saving to localStorage:", localError);
      }
    } finally {
      setAdFormLoading(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    // Removed userId check since we're using IP-based storage now
    if (typeof adId !== "string" || adId === "") {
      // Use custom alert modal
      setModalMessage("Cannot delete ad: Invalid Ad ID provided.");
      setIsModalConfirm(false);
      setModalOnCancel(() => () => setShowConfirmationModal(false));
      setModalTitle("Error");
      setShowConfirmationModal(true);
      console.error("handleDeleteAd: Invalid Ad ID for deletion:", adId);
      return;
    }

    // Use custom confirmation modal instead of browser confirm()
    setModalMessage("Are you sure you want to delete this ad?");
    setIsModalConfirm(true);
    setModalOnConfirm(() => async () => {
      setShowConfirmationModal(false);
      try {
        setLoadingMyAds(true); // Indicate loading when deleting and refetching
        const response = await fetch(`/api/saved-ads?adId=${adId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete ad.");
        }

        await fetchMySavedAds(); // Refresh the list
      } catch (error: any) {
        console.error("Error deleting ad:", error); // LOG
        // Use custom alert modal for deletion errors
        setModalMessage(error.message || "Error deleting ad.");
        setIsModalConfirm(false);
        setModalOnCancel(() => () => setShowConfirmationModal(false));
        setModalTitle("Deletion Error");
        setShowConfirmationModal(true);
      } finally {
        setLoadingMyAds(false); // Finished loading
      }
    });
    setModalOnCancel(() => () => setShowConfirmationModal(false));
    setShowConfirmationModal(true);
  };

  const openEditModal = (ad: UserAd) => {
    setCurrentAdToEdit(ad);
    setNewAdName(ad.name);
    setNewAdDescription(ad.description);
    setNewAdType(ad.type); // Set the type when editing
    setShowAddEditModal(true);
  };


  const resetAdForm = () => {
    setCurrentAdToEdit(null);
    setNewAdName("");
    setNewAdDescription("");
    setNewAdType(""); // Reset type when clearing form
    setAdFormError("");
  };

  // AI Assistant function
  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return;

    setAILoading(true);
    setAIResponse("");

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: aiQuery,
          templates: templates,
          categories: OFFICIAL_CATEGORIES,
          categoryDisplayNames: CATEGORY_DISPLAY_NAMES,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      setAIResponse(data.response);
      setShowFeedback(true); // Show feedback option after getting response
    } catch (error) {
      console.error("AI Assistant error:", error);
      setAIResponse("Sorry, I encountered an error. Please try again.");
    } finally {
      setAILoading(false);
    }
  };

  // Feedback handling function
  const handleFeedback = async () => {
    if (!feedbackText.trim()) return;

    setFeedbackLoading(true);
    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: aiQuery,
          templates: templates,
          categories: OFFICIAL_CATEGORIES,
          categoryDisplayNames: CATEGORY_DISPLAY_NAMES,
          feedback: feedbackText,
          originalResponse: aiResponse,
          correctCategory: selectedCategory,
        }),
      });

      const data = await response.json();
      if (data.feedbackStored) {
        setFeedbackText("");
        setSelectedCategory("");
        setShowFeedback(false);
        // Show success message
        setModalMessage(
          "Thank you for your feedback! I've learned from your correction and will apply this knowledge to future similar requests."
        );
        setModalTitle("Feedback Submitted");
        setModalOnConfirm(() => () => setShowConfirmationModal(false));
        setModalOnCancel(() => () => setShowConfirmationModal(false));
        setIsModalConfirm(false);
        setShowConfirmationModal(true);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setModalMessage(
        "Sorry, there was an error submitting your feedback. Please try again."
      );
      setModalTitle("Error");
      setModalOnConfirm(() => () => setShowConfirmationModal(false));
      setModalOnCancel(() => () => setShowConfirmationModal(false));
      setIsModalConfirm(false);
      setShowConfirmationModal(true);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Sync templates function
  const syncTemplates = async () => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncStatus("Starting comprehensive sync...");
    setSyncProgress({ current: 0, total: Object.keys(SHEET_URLS).length });

    try {
      console.log("🔄 Syncing all template categories...");

      const response = await fetch("/api/sync-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Sync result:", result);

      setSyncStatus(
        `Synced ${result.data.successCount} categories with ${result.data.totalTemplates} templates!`
      );
      setSyncProgress({
        current: result.data.successCount,
        total: Object.keys(SHEET_URLS).length,
      });

      // Update last sync time
      setLastSyncTime(new Date().toLocaleString());

      // Reload templates after sync
      setSyncStatus("Reloading templates...");
      // Note: initializeData is called in useEffect, so we'll trigger a re-render instead
      window.location.reload();

      setSyncStatus("Sync completed successfully!");

      // Clear status after 5 seconds
      setTimeout(() => {
        setSyncStatus("");
        setSyncProgress({ current: 0, total: 0 });
      }, 5000);
    } catch (error) {
      console.error("❌ Sync error:", error);
      setSyncError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      setSyncStatus("Sync failed!");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const loadPapaParseScript = () => {
      if (papaScriptLoaded.current || (window as any).Papa) {
        papaScriptLoaded.current = true;
        return Promise.resolve();
      }

      return new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js";
        script.async = true;
        script.onload = () => {
          papaScriptLoaded.current = true;
          resolve();
        };
        script.onerror = () => {
          console.error("Failed to load PapaParse script.");
          reject(new Error("Failed to load PapaParse script."));
        };
        document.head.appendChild(script);
      });
    };

    const fetchAndProcessCSV = async (url: string, canonicalCat: string) => {
      try {
        const res = await fetch(url);
        const csvText = await res.text();

        if (typeof (window as any).Papa === "undefined") {
          throw new Error("PapaParse is still not defined after script load.");
        }
        const Papa = (window as any).Papa;

        const parsed = Papa.parse(csvText, {
          header: false,
          skipEmptyLines: true,
        });
        const rows: any[] = parsed.data;

        const data = rows
          .map((row) => {
            const originalName = (row[0] || "").trim();
            const originalDescription = (row[1] || "").trim();
            let originalType = (row[2] || "").trim();

            // Specific fix for "Office" category: if original type is empty, set it to "work"
            if (canonicalCat === "office" && !originalType) {
              originalType = "work";
            }

            const normalizedName = normalizeSearchText(originalName);
            const normalizedDescription =
              normalizeSearchText(originalDescription);
            const normalizedType = normalizeSearchText(originalType);

            // NEW LOG: Confirm normalization during CSV parsing
            console.log(
              `[CSV_Parse_Debug] Original Name: '${originalName}' -> Normalized Name: '${normalizedName}'`
            );
            console.log(
              `[CSV_Parse_Debug] Original Desc: '${originalDescription}' -> Normalized Desc: '${normalizedDescription}'`
            );

            return {
              name: originalName,
              description: originalDescription,
              type: originalType,
              normalizedName: normalizedName,
              normalizedDescription: normalizedDescription,
              normalizedType: normalizedType,
              category: canonicalCat,
              displayCategory: formatCategoryDisplayName(canonicalCat),
            };
          })
          .filter((t) => t.name !== ""); // Filter out any entries that ended up with an empty name

        return data;
      } catch (err) {
        console.error(`Error fetching CSV for ${canonicalCat}:`, err);
        return [];
      }
    };

    const initializeData = async () => {
      setLoading(true);
      await loadPapaParseScript();

      const allTemplatesData: Template[] = [];
      const fetchPromises: Promise<Template[]>[] = [];

      // Fetch all templates for global search, from all defined categories
      const allCategoryUrls = ALL_TEMPLATE_CATEGORIES.map((cat: string) => ({
        url: SHEET_URLS[cat],
        canonicalCat: cat,
      })).filter((item: any) => item.url && !item.url.startsWith("YOUR_"));

      for (const { url, canonicalCat } of allCategoryUrls) {
        fetchPromises.push(fetchAndProcessCSV(url, canonicalCat));
      }

      // Execute all fetch operations concurrently
      const results = await Promise.all(fetchPromises);

      // Consolidate results for allFetchedTemplates
      results.forEach((res) => allTemplatesData.push(...res));
      setAllFetchedTemplates(allTemplatesData);

      // Filter for the initially active category from the fully loaded data
      const initialFilteredTemplates = allTemplatesData.filter(
        (t) => t.displayCategory === activeCategory
      );
      setTemplates(initialFilteredTemplates);

      setLoading(false);
    };

    initializeData();
  }, []); // Run once on mount to load all data

  // Effect to fetch user ads when showMyAds is true
  useEffect(() => {
    console.log("useEffect for fetchMySavedAds. State:", {
      showMyAds,
      currentLoading: loading,
    });

    if (!loading && showMyAds) {
      console.log("Triggering fetchMySavedAds due to showMyAds being true.");
      fetchMySavedAds();
    } else if (!showMyAds) {
      console.log("showMyAds is false, not fetching saved ads.");
    }
  }, [fetchMySavedAds, showMyAds, loading]);

  // Effect to update `templates` when `activeCategory` changes (when search is empty)
  useEffect(() => {
    if (!searchQuery && allFetchedTemplates.length > 0 && !showMyAds) {
      const categoryFiltered = allFetchedTemplates.filter(
        (t) => t.displayCategory === activeCategory
      );
      setTemplates(categoryFiltered);
    }
  }, [activeCategory, allFetchedTemplates, searchQuery, showMyAds]);

  // Effect to refresh templates when switching back to "Show All Ads"
  useEffect(() => {
    if (!showMyAds && allFetchedTemplates.length > 0 && !searchQuery) {
      const categoryFiltered = allFetchedTemplates.filter(
        (t) => t.displayCategory === activeCategory
      );
      setTemplates(categoryFiltered);
    }
  }, [showMyAds, allFetchedTemplates, searchQuery, activeCategory]);

  // Autocomplete logic for search suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestedTemplate("");
      return;
    }

    // Don't show autocomplete if the search query is too long (prevents overlap)
    if (searchQuery.length > 50) {
      setSuggestedTemplate("");
      return;
    }

    const input = searchQuery.trim().toLowerCase();
    const sourceTemplates = showMyAds ? mySavedAds : allFetchedTemplates;

    // Find a template that starts with the search query
    const suggestion = sourceTemplates.find(
      (template) =>
        template.name.toLowerCase().startsWith(input) ||
        template.description.toLowerCase().startsWith(input) ||
        template.type.toLowerCase().startsWith(input)
    );

    if (suggestion && suggestion.name.toLowerCase() !== input) {
      // Prefer name matches, then description, then type
      let suggestedText = "";
      if (suggestion.name.toLowerCase().startsWith(input)) {
        suggestedText = suggestion.name;
      } else if (suggestion.description.toLowerCase().startsWith(input)) {
        suggestedText = suggestion.description;
      } else {
        suggestedText = suggestion.type;
      }

      // Only show suggestion if there's enough space and it's not too long
      if (suggestedText.length > input.length && suggestedText.length < 80) {
        setSuggestedTemplate(suggestedText);
      } else {
        setSuggestedTemplate("");
      }
    } else {
      setSuggestedTemplate("");
    }
  }, [searchQuery, showMyAds, allFetchedTemplates, mySavedAds]);

  // Animation function for autocomplete
  const animateAutocomplete = (newValue: string) => {
    setIsAnimating(true);

    // Animate text building by gradually revealing characters
    const currentText = searchQuery;
    const newText = newValue;
    const charsToAdd = newText.slice(currentText.length);

    if (charsToAdd.length > 0) {
      let currentIndex = currentText.length;
      const interval = setInterval(() => {
        if (currentIndex < newText.length) {
          setSearchQuery(newText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(interval);
          setTimeout(() => setIsAnimating(false), 100);
        }
      }, 50); // 50ms delay between each character
    } else {
      setSearchQuery(newText);
      setTimeout(() => setIsAnimating(false), 100);
    }
  };

  const filteredTemplates = useMemo(() => {
    // Optimized filtering for better performance
    const normalizedSearchQuery = normalizeSearchText(debouncedSearchQuery); // Use debounced search query

    if (normalizedSearchQuery === "") {
      const source = showMyAds ? mySavedAds : templates;

      return source;
    } else {
      const sourceTemplates = showMyAds ? mySavedAds : allFetchedTemplates;

      let impliedCategoryCanonical: string | null = null;
      for (const canonicalCat of OFFICIAL_CATEGORIES) {
        const normalizedCanonicalCat = normalizeSearchText(canonicalCat);
        if (
          normalizedSearchQuery.startsWith(normalizedCanonicalCat) ||
          normalizedSearchQuery === normalizedCanonicalCat
        ) {
          impliedCategoryCanonical = canonicalCat;
          break;
        }
      }

      const searchTerms = normalizedSearchQuery
        .split(" ")
        .filter((term) => term.length > 0);

      const allMatches = sourceTemplates.filter((t) => {
        // Essential defensive check for 't' object being valid before accessing properties
        if (
          !t ||
          typeof t.name !== "string" ||
          typeof t.normalizedName !== "string"
        ) {
          return false;
        }
        const normalizedNameForSearch = t.normalizedName;
        const normalizedDescriptionForSearch = t.normalizedDescription; // Also include description in search

        const matchesSearch = searchTerms.every((term) => {
          // Use simple includes() instead of regex for better performance
          const nameMatch = normalizedNameForSearch
            .toLowerCase()
            .includes(term.toLowerCase());
          const descriptionMatch = normalizedDescriptionForSearch
            .toLowerCase()
            .includes(term.toLowerCase());

          return nameMatch || descriptionMatch; // Match if found in name OR description
        });
        return matchesSearch;
      });

      if (impliedCategoryCanonical) {
        const prioritizedResults = allMatches.filter(
          (t) => t.category === impliedCategoryCanonical
        );
        const secondaryResults = allMatches.filter(
          (t) => t.category !== impliedCategoryCanonical
        );
        return [...prioritizedResults, ...secondaryResults];
      } else {
        return allMatches;
      }
    }
  }, [
    templates,
    allFetchedTemplates,
    debouncedSearchQuery,
    showMyAds,
    mySavedAds,
  ]);

  const handleCopy = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch((err) => {
        console.error("Failed to copy using navigator.clipboard:", err);
        copyToClipboardFallback(text);
      });
    } else {
      copyToClipboardFallback(text);
    }
  };

  const copyToClipboardFallback = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Fallback: Unable to copy text:", err);
    }
    document.body.removeChild(textarea);
  };

  return (
    <div
      className={`min-h-screen font-inter p-4 sm:p-6 md:p-8 transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100"
          : "bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800"
      }`}
    >
      <main
        className={`max-w-7xl mx-auto rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 border transition-colors duration-300 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-100"
        }`}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-red-800 to-red-900 to-red-900 drop-shadow-lg py-3 rounded-xl">
          {mainTitle}
        </h1>
        
        {/* Last Sync Time */}
        {lastSyncTime && (
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Last synced: <span className="font-medium text-gray-800 dark:text-gray-200">{lastSyncTime}</span>
            </p>
          </div>
        )}

        {/* Top Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <a
            href="https://docs.google.com/spreadsheets/d/1vfQSNESlFUqWgy6Oje61_RCvLEKKUMnG6YzUVXpwG2E/edit?gid=0#gid=0"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
          >
            📊 Vehicle/Clothing List
          </a>
          <a
            href="https://docs.google.com/document/d/1zNTpF4bmcjOVef6XmCvq3x6DxPkWAFNdJJE5mwS5D3o/edit?tab=t.0"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
          >
            📋 Internal Policy
          </a>
          <button
            onClick={() => setShowAIAssistant(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
          >
            📝 Format My Ad
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`px-4 py-3 font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2 ${
              isDarkMode
                ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                : "bg-gray-800 hover:bg-gray-900 text-white"
            }`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <>
                <SunIcon className="w-5 h-5" />
                Light
              </>
            ) : (
              <>
                <MoonIcon className="w-5 h-5" />
                Dark
              </>
            )}
          </button>
        </div>

        <div className="mb-6 flex justify-center px-2 relative">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Search all templates by name, description, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-5 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                isDarkMode
                  ? `bg-gray-700 text-white border-gray-600 ${
                      isAnimating ? "bg-green-900 border-green-500" : ""
                    }`
                  : `bg-white text-black border-gray-300 ${
                      isAnimating ? "bg-green-50 border-green-500" : ""
                    }`
              }`}
            />

            {/* Clickable autocomplete helper positioned after user's text */}
            {suggestedTemplate && suggestedTemplate !== searchQuery && (
              <div className="absolute inset-0 flex items-center pointer-events-none">
                <span
                  className="text-gray-600 font-normal absolute pointer-events-auto"
                  style={{
                    left: `calc(1.25rem + ${
                      (searchQuery.length +
                        (searchQuery.match(/\s/g) || []).length * 0.2) *
                      0.5
                    }rem + 0.01rem)`,
                  }}
                >
                  <button
                    onClick={() => {
                      animateAutocomplete(suggestedTemplate);
                    }}
                    className={`cursor-pointer font-normal transition-colors duration-200 pr-8 text-build ${
                      isDarkMode
                        ? "text-gray-400/70 hover:text-gray-200"
                        : "text-gray-500/70 hover:text-gray-700"
                    }`}
                  >
                    {suggestedTemplate.slice(searchQuery.length).toLowerCase()}
                  </button>
                </span>
                {/* Clickable area for the right side of the search box when suggestion exists */}
                {suggestedTemplate && suggestedTemplate !== searchQuery && (
                  <div
                    onClick={() => {
                      animateAutocomplete(suggestedTemplate);
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
          {/* Saved Ads Button - Always visible */}
          <button
            onClick={() => {
              if (!showMyAds) {
                // Switch to saved ads
                setShowMyAds(true);
                setSearchQuery(""); // Clear search when switching to saved ads
                setDebouncedSearchQuery(""); // Clear debounced search immediately
                setActiveCategory(""); // Clear active category
                setMainTitle("My Saved Ads"); // Update main title
                fetchMySavedAds(); // Fetch saved ads
              }
            }}
            className={`absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200
              ${
                showMyAds
                  ? "bg-red-700 text-white shadow-xl"
                  : isDarkMode
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
          >
            {showMyAds ? "Show All Templates" : "Saved Ads"}
          </button>
        </div>

        {!showMyAds && ( // Only show category buttons if not showing "My Saved Ads"
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 px-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSearchQuery(""); // Clear search query when changing category
                }}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md
                  ${
                    activeCategory === cat && searchQuery === "" // Highlight only if active and no search
                      ? "bg-red-700 text-white shadow-xl ring-2 ring-red-300 hover:bg-red-800"
                      : isDarkMode
                      ? "bg-gray-600 text-gray-200 hover:bg-gray-500 hover:text-red-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {showMyAds && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => {
                resetAdForm();
                setShowAddEditModal(true);
              }}
              className="px-6 py-3 rounded-full font-semibold text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <PlusCircleIcon className="w-5 h-5" /> Add New Ad
            </button>
          </div>
        )}

        <section
          className={`min-h-[400px] rounded-2xl p-4 sm:p-6 border shadow-xl transition-colors duration-300 ${
            isDarkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-white border-gray-200"
          }`}
        >
          {authLoading ? ( // Auth loading is always top priority
            <p
              className={`text-center py-20 text-xl animate-pulse font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Checking authentication...
            </p>
          ) : showMyAds && loadingMyAds ? ( // NEW: Specific loading message for user ads
            <p
              className={`text-center py-20 text-xl animate-pulse font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Loading your ads...
            </p>
          ) : !showMyAds && loading ? ( // Existing loading for templates
            <p
              className={`text-center py-20 text-xl animate-pulse font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Loading templates, please wait...
            </p>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-20">
              {showMyAds ? (
                <div className="max-w-md mx-auto">
                  <div className="mb-6">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <PlusCircleIcon className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                      No Saved Ads Yet
                    </h3>
                    <p className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Create your first ad to get started!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      resetAdForm();
                      setShowAddEditModal(true);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <PlusCircleIcon className="w-5 h-5" /> Create Your First Ad
                  </button>
                </div>
              ) : (
                <p
                  className={`text-xl font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No templates found matching your criteria.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
                {filteredTemplates.slice(0, displayLimit).map((t, i) => {
                  if (!t) return null;
                  // Also ensure t.id is a string before passing to key or handleDeleteAd
                  // This now works because Template interface has optional 'id'
                  const itemId =
                    typeof t.id === "string" && t.id !== ""
                      ? t.id
                      : `fallback-${i}`;

                  return (
                    <div
                      key={itemId} // Use robust itemId for key
                      className={`relative p-4 border rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col group min-h-[200px] ${
                        showMyAds
                          ? isDarkMode
                            ? "bg-gradient-to-br from-blue-900/30 to-purple-900/30 text-gray-100 border-blue-500/50 hover:border-blue-400"
                            : "bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 border-blue-200 hover:border-blue-300"
                          : isDarkMode
                          ? "bg-gradient-to-br from-gray-600 to-gray-700 text-gray-100 border-gray-500 hover:border-red-400"
                          : "bg-gradient-to-br from-white to-gray-50 text-gray-800 border-gray-200 hover:border-red-400"
                      }`}
                    >
                      <div className="flex-grow mb-3">
                        <h3
                          className={`font-bold text-lg mb-2 leading-tight overflow-hidden text-ellipsis whitespace-nowrap ${
                            showMyAds
                              ? isDarkMode
                                ? "text-blue-400"
                                : "text-blue-700"
                              : isDarkMode
                              ? "text-red-400"
                              : "text-red-700"
                          }`}
                        >
                          {t.name ?? ""}{" "}
                          {/* Add nullish coalescing for safety */}
                        </h3>
                        <div className="mb-2 flex-grow">
                          <p
                            className={`text-sm leading-relaxed ${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            } ${
                              expandedDescriptions.has(itemId)
                                ? ""
                                : "overflow-hidden text-ellipsis whitespace-nowrap"
                            }`}
                            dangerouslySetInnerHTML={{ __html: t.description ?? "" }}
                          />
                          {t.description && t.description.length > 50 && (
                            <button
                              onClick={() => toggleDescriptionExpansion(itemId)}
                              className={`text-sm font-medium mt-2 transition-colors duration-200 ${
                                showMyAds
                                  ? isDarkMode
                                    ? "text-blue-400 hover:text-blue-300"
                                    : "text-blue-600 hover:text-blue-700"
                                  : isDarkMode
                                  ? "text-red-400 hover:text-red-300"
                                  : "text-red-600 hover:text-red-700"
                              }`}
                            >
                              {expandedDescriptions.has(itemId)
                                ? "See Less"
                                : "See More"}
                            </button>
                          )}
                        </div>
                        {/* Add Type display with custom icon and bold text */}
                        {t.type && (
                          <div
                            className={`flex items-center gap-3 text-sm font-medium ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            <span
                              className={
                                isDarkMode ? "text-gray-500" : "text-gray-500"
                              }
                            >
                              Type:
                            </span>
                            <img
                              src={getTypeIcon(t.type)}
                              alt={`${t.type} icon`}
                              className="w-6 h-6 object-contain rounded-lg shadow-sm"
                            />
                            <span
                              className={`font-bold text-base ${
                                isDarkMode ? "text-gray-200" : "text-gray-800"
                              }`}
                            >
                              {t.type}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-auto text-right flex justify-end items-center gap-2">
                        {" "}
                        {/* Adjusted to include gap for new icon */}
                        {showMyAds ? ( // Show edit/delete buttons for user's ads
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {/* NEW: Copy Description button for saved ads */}
                            <button
                              onClick={() => handleCopy(t.description ?? "")} // Copies only the description
                              className="p-1.5 rounded-full bg-gray-100 hover:bg-blue-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                              title="Copy description to clipboard"
                            >
                              <ClipboardIcon className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => openEditModal(t as UserAd)} // Cast to UserAd as we are in showMyAds context
                              className="p-1.5 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                              title="Edit ad"
                            >
                              <PencilIcon className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteAd(itemId)} // Use robust itemId
                              className="p-1.5 rounded-full bg-red-100 hover:bg-red-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                              title="Delete ad"
                            >
                              <TrashIcon className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        ) : (
                          // Show copy button for general templates
                          <button
                            onClick={() => handleCopy(getAdDisplayContent(t))} // Copy description only
                            className="p-1.5 rounded-full bg-gray-100 hover:bg-red-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all ease-out duration-300"
                            title="Copy template description to clipboard"
                          >
                            <ClipboardIcon className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {filteredTemplates.length > displayLimit && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() =>
                      setDisplayLimit((prev) =>
                        Math.min(prev + 50, filteredTemplates.length)
                      )
                    }
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    Load More Templates (
                    {filteredTemplates.length - displayLimit} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Add/Edit Ad Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div
            className={`rounded-xl shadow-2xl p-8 max-w-md w-full relative transition-colors duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-6 text-center ${
                isDarkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              {currentAdToEdit ? "Edit Your Ad" : "Add New Ad"}
            </h2>
            <button
              onClick={() => {
                setShowAddEditModal(false);
                resetAdForm();
              }}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors duration-300 ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              title="Close"
            >
              <XCircleIcon
                className={`w-6 h-6 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              />
            </button>

            {adFormError && (
              <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm text-center border border-red-200">
                {adFormError}
              </p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveAd();
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="adName"
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Ad Name
                </label>
                <input
                  type="text"
                  id="adName"
                  value={newAdName}
                  onChange={(e) => setNewAdName(e.target.value)}
                  className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                  disabled={adFormLoading}
                />
              </div>
              <div>
                <label
                  htmlFor="adDescription"
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Description
                </label>
                <textarea
                  id="adDescription"
                  value={newAdDescription}
                  onChange={(e) => setNewAdDescription(e.target.value)}
                  rows={4}
                  className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 resize-none transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                  disabled={adFormLoading}
                ></textarea>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    "Work",
                    "Auto",
                    "Service",
                    "Business",
                    "Real Estate",
                    "Dating",
                    "Discount",
                    "Other",
                  ].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewAdType(type)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-1 ${
                        newAdType === type
                          ? isDarkMode
                            ? "border-red-500 bg-red-900/30 text-red-400"
                            : "border-red-500 bg-red-50 text-red-700"
                          : isDarkMode
                          ? "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                      disabled={adFormLoading}
                    >
                      <img
                        src={getTypeIcon(type)}
                        alt={`${type} icon`}
                        className="w-6 h-6 object-contain"
                      />
                      <span className="text-xs font-medium">{type}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-sm flex items-center justify-center gap-2"
                disabled={adFormLoading}
              >
                {adFormLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5" />{" "}
                    {currentAdToEdit ? "Update Ad" : "Add Ad"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Ad Helper Screen */}
      {showAIAssistant && (
        <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
          <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-950 to-blue-900">
            {/* Header */}
            <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
              <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setShowAIAssistant(false);
                      setAIQuery("");
                      setAIResponse("");
                      setShowFeedback(false);
                      setFeedbackText("");
                      setSelectedCategory("");
                    }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                    title="Back to Templates"
                  >
                    <XCircleIcon className="w-6 h-6 text-white" />
                  </button>
                  <h1 className="text-2xl font-bold text-white">
                    📝 Ad Helper
                  </h1>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
              <div className="bg-white rounded-xl shadow-2xl p-8">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Format Your Ad
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Paste your unformatted ad below and I'll help you format
                      it according to internal policy. Works with vehicles,
                      businesses, services, clothing, jobs, and more.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Unformatted Ad:
                      </label>
                      <textarea
                        value={aiQuery}
                        onChange={(e) => setAIQuery(e.target.value)}
                        placeholder="Paste your unformatted ad here... (e.g., 'selling my car', 'hiring chef', 'business for sale')"
                        className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base"
                        onKeyPress={(e) =>
                          e.key === "Enter" && !e.shiftKey && handleAIQuery()
                        }
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleAIQuery}
                        disabled={aiLoading || !aiQuery.trim()}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {aiLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Formatting...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="w-5 h-5" />
                            Format Ad
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setAIQuery("");
                          setAIResponse("");
                          setShowFeedback(false);
                          setFeedbackText("");
                        }}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all duration-200"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {aiResponse && (
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <h3 className="font-semibold text-blue-800 mb-3 text-lg">
                        Formatted Ad:
                      </h3>

                      {(() => {
                        const { adContent, category } =
                          extractAdContentAndCategory(aiResponse);
                        const categoryIcon = getCategoryIcon(category);

                        return (
                          <>
                            <div className="text-gray-700 whitespace-pre-wrap bg-white p-4 rounded border mb-3">
                              {adContent}
                            </div>

                            <div className="flex items-center justify-between">
                              {category && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-600">
                                    Category:
                                  </span>
                                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border">
                                    <img
                                      src={categoryIcon}
                                      alt={category}
                                      className="w-4 h-4"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                      {category}
                                    </span>
                                  </div>
                                </div>
                              )}

                              <button
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(
                                      adContent
                                    );
                                    // Visual feedback - temporarily change button text
                                    const button =
                                      event?.target as HTMLButtonElement;
                                    if (button) {
                                      const originalText = button.innerHTML;
                                      button.innerHTML =
                                        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Copied!';
                                      button.classList.add(
                                        "bg-green-600",
                                        "hover:bg-green-700"
                                      );
                                      button.classList.remove(
                                        "bg-blue-600",
                                        "hover:bg-blue-700"
                                      );

                                      setTimeout(() => {
                                        button.innerHTML = originalText;
                                        button.classList.remove(
                                          "bg-green-600",
                                          "hover:bg-green-700"
                                        );
                                        button.classList.add(
                                          "bg-blue-600",
                                          "hover:bg-blue-700"
                                        );
                                      }, 2000);
                                    }
                                  } catch (err) {
                                    console.error("Failed to copy: ", err);
                                  }
                                }}
                                className={`flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 ${
                                  !category ? "ml-auto" : ""
                                }`}
                                title="Copy formatted ad"
                              >
                                <ClipboardIcon className="w-4 h-4" />
                                Copy Ad
                              </button>
                            </div>
                          </>
                        );
                      })()}

                      {/* Feedback Section */}
                      {showFeedback && (
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <h4 className="font-medium text-blue-800 mb-3">
                            🤖 Help me improve! Was this formatting correct?
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Correct Category (if AI got it wrong):
                              </label>
                              <select
                                value={selectedCategory}
                                onChange={(e) =>
                                  setSelectedCategory(e.target.value)
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              >
                                <option value="">
                                  Select correct category (optional)
                                </option>
                                {OFFICIAL_CATEGORIES.map((category) => (
                                  <option key={category} value={category}>
                                    {CATEGORY_DISPLAY_NAMES[category] ||
                                      category}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <textarea
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                              placeholder="If this formatting is wrong, please provide the correct version. I'll learn from your correction!"
                              className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleFeedback}
                                disabled={
                                  feedbackLoading || !feedbackText.trim()
                                }
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              >
                                {feedbackLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Submitting...
                                  </>
                                ) : (
                                  "Submit Correction"
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setShowFeedback(false);
                                  setFeedbackText("");
                                }}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-all duration-200 text-sm"
                              >
                                Skip
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      What I can help with:
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>
                        • Format your ad according to{" "}
                        <a
                          href="https://docs.google.com/document/d/1zNTpF4bmcjOVef6XmCvq3x6DxPkWAFNdJJE5mwS5D3o/edit?tab=t.0"
                          target="_blank"
                          className="text-blue-600 hover:underline"
                        >
                          LifeInvader Internal Policy
                        </a>
                      </li>
                      <li>
                        • Use correct vehicle names from{" "}
                        <a
                          href="https://docs.google.com/spreadsheets/d/1vfQSNESlFUqWgy6Oje61_RCvLEKKUMnG6YzUVXpwG2E/edit"
                          target="_blank"
                          className="text-blue-600 hover:underline"
                        >
                          approved vehicle list
                        </a>
                      </li>
                      <li>• Structure ads professionally</li>
                      <li>• Suggest the right category</li>
                      <li>• Just paste your ad and get a formatted result</li>
                      <li>
                        • Powered by Google Gemini AI with access to policy
                        documents
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation/Alert Modal */}
      {showConfirmationModal && (
        <ConfirmationModal
          message={modalMessage}
          onConfirm={modalOnConfirm}
          onCancel={modalOnCancel}
          isConfirm={isModalConfirm}
          title={modalTitle}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
