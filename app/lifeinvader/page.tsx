"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  ClipboardIcon,
  PlusCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon, // Replaced SaveIcon with CheckIcon
} from "@heroicons/react/24/outline";
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
  userId: string; // The ID of the user who saved it
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// Canonical names for internal logic and URL mapping (all lowercase for consistency)
const CANONICAL_CATEGORIES = [
  "24 7 store",
  "ammunition store",
  "atm",
  "bars",
  "car sharing",
  "chip tuning",
  "car wash",
  "clothing store",
  "electrical station",
  "family",
  "farm",
  "gas station",
  "hair salon",
  "jewellery store",
  "juice shop",
  "law firm",
  "misc/own business",
  "office",
  "oil well",
  "organisation",
  "parking",
  "pet shop",
  "service station",
  "tattoo parlor",
  "taxi cab",
  "warehouse",
];

// Map canonical category names to their user-friendly display names
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
};

// Map canonical category names to their respective Google Sheet published CSV URLs.
// YOU WILL NEED TO REPLACE PLACEHOLDER URLS WITH YOUR ACTUAL PUBLISHED CSV LINKS.
const SHEET_URLS: { [key: string]: string } = {
  "24 7 store":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=81154121&single=true&output=csv", // Original URL for 24/7
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
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=488626062&single=true&output=csv", // Corrected 'sheets' to 'spreadsheets'
  "tattoo parlor":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1491755766&single=true&output=csv", // Corrected 'sheets' to 'spreadsheets'
  "taxi cab":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1643962212&single=true&output=csv", // Corrected 'sheets' to 'spreadsheets'
  warehouse:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=366962962&single=true&output=csv", // Corrected 'sheets' to 'spreadsheets'
};

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

  // Try to match against the predefined CANONICAL_CATEGORIES
  for (const sheetCat of CANONICAL_CATEGORIES) {
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
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  message,
  onConfirm,
  onCancel,
  isConfirm,
  title,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full relative text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {title || (isConfirm ? "Confirm Action" : "Notice")}
        </h2>
        <p className="text-gray-700 mb-6">{message}</p>
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
                ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
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
  const name = ad.name ?? "";
  const description = ad.description ?? "";
  return `${name}\n${description}`; // Simple text with name and description
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

  const [mainTitle, setMainTitle] = useState("LifeInvader Templates"); // New state for main title
  const [templates, setTemplates] = useState<Template[]>([]);
  const [allFetchedTemplates, setAllFetchedTemplates] = useState<Template[]>(
    []
  );
  const [categories, setCategories] = useState<string[]>(
    CANONICAL_CATEGORIES.map(formatCategoryDisplayName)
  );
  const [activeCategory, setActiveCategory] = useState(
    CANONICAL_CATEGORIES.length > 0
      ? formatCategoryDisplayName(CANONICAL_CATEGORIES[0])
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
    console.log(
      "fetchMySavedAds called. isAuthenticated:",
      isAuthenticated,
      "userId:",
      userId
    ); // LOG
    if (!isAuthenticated || !userId) {
      console.log(
        "fetchMySavedAds: Not authenticated or userId is missing. Skipping fetch."
      ); // LOG
      setMySavedAds([]);
      return;
    }
    setLoadingMyAds(true); // Use loadingMyAds for user ads
    try {
      // Guard against userId being potentially undefined, though the above check should cover it
      if (typeof userId !== "string" || userId === "") {
        console.error(
          "fetchMySavedAds: userId is not a valid string. Aborting API call."
        ); // LOG
        setMySavedAds([]);
        setLoadingMyAds(false); // Reset loading state
        return;
      }
      const response = await fetch(`/api/user-ads?userId=${userId}`);
      console.log("fetchMySavedAds: API response status:", response.status); // LOG
      if (!response.ok) {
        const errorText = await response.text(); // Capture error text from response
        console.error("fetchMySavedAds: API response error text:", errorText); // LOG
        throw new Error(
          `HTTP ${response.status}: Failed to fetch saved ads. Details: ${errorText}`
        );
      }
      const data: UserAd[] = await response.json();
      console.log("fetchMySavedAds: Received data:", data); // LOG
      setMySavedAds(data);
    } catch (error: any) {
      console.error("Error fetching user ads:", error); // LOG
      setMySavedAds([]);
      // Use custom alert modal
      setModalMessage(error.message || "Failed to load your ads.");
      setIsModalConfirm(false);
      setModalOnCancel(() => () => setShowConfirmationModal(false));
      setModalTitle("Error");
      setShowConfirmationModal(true);
    } finally {
      setLoadingMyAds(false); // Finished loading for user ads
    }
  }, [isAuthenticated, userId]);

  // Handle adding/editing a user ad
  const handleSaveAd = async () => {
    setAdFormLoading(true);
    setAdFormError("");

    console.log("handleSaveAd: Attempting to save/edit ad."); // LOG
    console.log(
      "handleSaveAd: userId:",
      userId,
      "currentAdToEdit:",
      currentAdToEdit
    ); // LOG

    if (!newAdName || !newAdDescription) {
      // Simplified required fields
      setAdFormError("Ad Name and Description are required.");
      setAdFormLoading(false);
      return;
    }
    if (!userId) {
      setAdFormError("User not authenticated.");
      setAdFormLoading(false);
      return;
    }

    // Define default type, category, and displayCategory for user-created ads
    const defaultType = "User Ad";
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
      userId: userId,
    };

    try {
      const method = currentAdToEdit ? "PUT" : "POST";
      let url = `/api/user-ads?userId=${userId}`;
      if (currentAdToEdit) {
        // Ensure currentAdToEdit.id is a string and not undefined/null
        if (
          typeof currentAdToEdit.id !== "string" ||
          currentAdToEdit.id === ""
        ) {
          throw new Error("Ad ID for editing is invalid.");
        }
        url = `/api/user-ads?userId=${userId}&adId=${currentAdToEdit.id}`;
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

      if (!response.ok) {
        const errorData = await response.json();
        console.error("handleSaveAd: API response error data:", errorData); // LOG
        throw new Error(errorData.message || "Failed to save ad.");
      }

      // Check the exact data received from the API after saving
      const responseData = await response.json();
      console.log(
        "handleSaveAd: Raw API response data on success:",
        responseData
      ); // LOG

      await fetchMySavedAds(); // Refresh the list of ads
      setShowAddEditModal(false);
      resetAdForm();
    } catch (error: any) {
      setAdFormError(error.message || "Error saving ad.");
      console.error("Error saving ad:", error); // LOG
    } finally {
      setAdFormLoading(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!userId) {
      // Use custom alert modal
      setModalMessage("User not authenticated to delete ads.");
      setIsModalConfirm(false);
      setModalOnCancel(() => () => setShowConfirmationModal(false));
      setModalTitle("Authentication Error");
      setShowConfirmationModal(true);
      return;
    }
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
        const response = await fetch(
          `/api/user-ads?userId=${userId}&adId=${adId}`,
          {
            method: "DELETE",
          }
        );

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
    // Removed setting type and category as they are no longer in the form
    // setNewAdType(ad.type);
    // setNewAdCategory(ad.category);
    setShowAddEditModal(true);
  };

  const resetAdForm = () => {
    setCurrentAdToEdit(null);
    setNewAdName("");
    setNewAdDescription("");
    // Removed resetting type and category as they are no longer in the form
    // setNewAdType("");
    // setNewAdCategory(CANONICAL_CATEGORIES[0] || "");
    setAdFormError("");
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
      const allCategoryUrls = CANONICAL_CATEGORIES.map((cat) => ({
        url: SHEET_URLS[cat],
        canonicalCat: cat,
      })).filter((item) => item.url && !item.url.startsWith("YOUR_"));

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

  // Effect to fetch user ads when authenticated and userId is available
  useEffect(() => {
    // LOG: State before fetching user ads
    console.log("useEffect for fetchMySavedAds. Auth State:", {
      isAuthenticated,
      userId,
      showMyAds,
      authLoading,
      currentLoading: loading, // Added current loading state
    });

    // Ensure userId is a non-empty string before attempting to fetch
    if (
      !authLoading &&
      isAuthenticated &&
      typeof userId === "string" &&
      userId !== "" &&
      showMyAds
    ) {
      // Only fetch if showMyAds is true
      console.log(
        "Triggering fetchMySavedAds due to authenticated user and valid userId and showMyAds is true."
      );
      fetchMySavedAds();
    } else if (
      !authLoading &&
      (!isAuthenticated || typeof userId !== "string" || userId === "")
    ) {
      console.log(
        "Not authenticated or invalid userId, or auth still loading. Resetting mySavedAds."
      );
      setMySavedAds([]); // Clear ads if not authenticated or userId is invalid
    }
  }, [
    isAuthenticated,
    userId,
    fetchMySavedAds,
    showMyAds,
    authLoading,
    loading,
  ]); // Added authLoading, loading to dependencies

  // Effect to update `templates` when `activeCategory` changes (when search is empty)
  useEffect(() => {
    if (!searchQuery && allFetchedTemplates.length > 0 && !showMyAds) {
      const categoryFiltered = allFetchedTemplates.filter(
        (t) => t.displayCategory === activeCategory
      );
      setTemplates(categoryFiltered);
    }
  }, [activeCategory, allFetchedTemplates, searchQuery, showMyAds]);

  // Autocomplete logic for search suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
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
      if (suggestion.name.toLowerCase().startsWith(input)) {
        setSuggestedTemplate(suggestion.name);
      } else if (suggestion.description.toLowerCase().startsWith(input)) {
        setSuggestedTemplate(suggestion.description);
      } else {
        setSuggestedTemplate(suggestion.type);
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
      for (const canonicalCat of CANONICAL_CATEGORIES) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 font-inter text-gray-800 p-4 sm:p-6 md:p-8">
      <main className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-100">
        <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-red-800 to-red-900 to-red-900 drop-shadow-lg py-3 rounded-xl">
          {mainTitle}
        </h1>

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
        </div>

        <div className="mb-6 flex justify-center px-2 relative">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Search all templates by name, description, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full p-4 rounded-full border border-gray-300 focus:outline-none focus:ring-4 focus:ring-red-200 shadow-lg text-lg transition-all duration-300 ease-in-out placeholder-gray-500 ${
                isAnimating ? "bg-green-50 border-green-300" : ""
              }`}
            />

            {/* Clickable autocomplete helper positioned after user's text */}
            {suggestedTemplate && suggestedTemplate !== searchQuery && (
              <div className="absolute inset-0 flex items-center pointer-events-none">
                <span
                  className="text-lg text-gray-600 font-normal absolute pointer-events-auto"
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
                    className="text-gray-600/70 hover:text-gray-600 cursor-pointer font-normal transition-colors duration-200 pr-8 text-build"
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
          {isAuthenticated && (
            <button
              onClick={() => {
                setShowMyAds((prev) => {
                  const newState = !prev;
                  setSearchQuery(""); // Clear search when toggling My Ads
                  setActiveCategory(""); // Clear category selection when toggling My Ads
                  setMainTitle(
                    newState ? "My Saved Ads" : "LifeInvader Templates"
                  ); // Update main title
                  // Trigger fetchMySavedAds if now showing My Ads
                  if (newState) {
                    fetchMySavedAds();
                  }
                  return newState;
                });
              }}
              className={`absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200
                ${
                  showMyAds
                    ? "bg-red-700 text-white shadow-xl"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              {showMyAds ? "Show All Ads" : "My Saved Ads"}
            </button>
          )}
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
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {isAuthenticated && showMyAds && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => {
                resetAdForm();
                setShowAddEditModal(true);
              }}
              className="px-5 py-2.5 rounded-full font-medium text-sm bg-red-600 text-white hover:bg-red-700 transition-colors duration-300 flex items-center gap-2 shadow-md"
            >
              <PlusCircleIcon className="w-4 h-4" /> Add New Ad
            </button>
          </div>
        )}

        <section className="min-h-[400px] bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-xl">
          {authLoading ? ( // Auth loading is always top priority
            <p className="text-gray-700 text-center py-20 text-xl animate-pulse font-medium">
              Checking authentication...
            </p>
          ) : showMyAds && loadingMyAds ? ( // NEW: Specific loading message for user ads
            <p className="text-gray-700 text-center py-20 text-xl animate-pulse font-medium">
              Loading your ads...
            </p>
          ) : !showMyAds && loading ? ( // Existing loading for templates
            <p className="text-gray-700 text-center py-20 text-xl animate-pulse font-medium">
              Loading templates, please wait...
            </p>
          ) : filteredTemplates.length === 0 ? (
            <p className="text-gray-500 text-center py-20 text-xl font-medium">
              {showMyAds
                ? "You haven't saved any ads yet."
                : "No templates found matching your criteria."}
            </p>
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
                      className="relative p-4 bg-gradient-to-br from-white to-gray-50 text-gray-800 border border-gray-200 rounded-lg shadow-md hover:shadow-lg hover:border-red-400 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between group"
                    >
                      <div className="flex-grow mb-3">
                        <h3 className="font-bold text-lg text-red-700 mb-2 leading-tight line-clamp-2">
                          {t.name ?? ""}{" "}
                          {/* Add nullish coalescing for safety */}
                        </h3>
                        <div className="mb-2">
                          <p
                            className={`text-gray-700 text-xs leading-relaxed ${
                              expandedDescriptions.has(itemId)
                                ? ""
                                : "line-clamp-3"
                            }`}
                          >
                            {t.description ?? ""}
                          </p>
                          {t.description && t.description.length > 120 && (
                            <button
                              onClick={() => toggleDescriptionExpansion(itemId)}
                              className="text-red-600 hover:text-red-700 text-xs font-medium mt-1 transition-colors duration-200"
                            >
                              {expandedDescriptions.has(itemId)
                                ? "See Less"
                                : "See More"}
                            </button>
                          )}
                        </div>
                        {/* Add Type display with custom icon and bold text */}
                        {t.type && (
                          <div className="flex items-center gap-3 text-gray-600 text-sm font-medium">
                            <span className="text-gray-500">Type:</span>
                            <img
                              src={getTypeIcon(t.type)}
                              alt={`${t.type} icon`}
                              className="w-6 h-6 object-contain rounded-lg shadow-sm"
                            />
                            <span className="font-bold text-base">
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
                            onClick={() => handleCopy(getAdDisplayContent(t))} // Copy simplified content (name + description)
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
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {currentAdToEdit ? "Edit Your Ad" : "Add New Ad"}
            </h2>
            <button
              onClick={() => {
                setShowAddEditModal(false);
                resetAdForm();
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              title="Close"
            >
              <XCircleIcon className="w-6 h-6 text-gray-600" />
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
                  className="block text-sm font-medium text-gray-700"
                >
                  Ad Name
                </label>
                <input
                  type="text"
                  id="adName"
                  value={newAdName}
                  onChange={(e) => setNewAdName(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  required
                  disabled={adFormLoading}
                />
              </div>
              <div>
                <label
                  htmlFor="adDescription"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="adDescription"
                  value={newAdDescription}
                  onChange={(e) => setNewAdDescription(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 resize-none"
                  required
                  disabled={adFormLoading}
                ></textarea>
              </div>
              {/* Removed Type Input Field */}
              {/* Removed Category Select Field */}
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

      {/* Custom Confirmation/Alert Modal */}
      {showConfirmationModal && (
        <ConfirmationModal
          message={modalMessage}
          onConfirm={modalOnConfirm}
          onCancel={modalOnCancel}
          isConfirm={isModalConfirm}
          title={modalTitle}
        />
      )}
    </div>
  );
}
