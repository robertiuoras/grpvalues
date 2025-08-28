"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { ClipboardIcon } from "@heroicons/react/24/outline";

// Define the interface for a template item
interface Template {
  name: string;
  description: string;
  type: string;
  category: string; // The raw extracted category for filtering logic
  displayCategory: string; // The user-friendly category name for display
  normalizedName: string; // Stored for efficient searching
  normalizedDescription: string; // Stored for efficient searching
  normalizedType: string; // Stored for efficient searching
}

// Canonical names for internal logic and URL mapping (all lowercase for consistency)
const CANONICAL_CATEGORIES = [
  "24 7 store",
  "ammunition store", "atm", "bars", "car sharing", "chip tuning", "car wash",
  "clothing store", "electrical station", "family", "farm", "gas station", "hair salon",
  "jewellery store", "juice shop", "law firm", "misc/own business", "office", "oil well", "organisation",
  "parking", "pet shop", "service station", "tattoo parlor", "taxi cab", "warehouse"
];

// Map canonical category names to their user-friendly display names
const CATEGORY_DISPLAY_NAMES: { [key: string]: string } = {
  "24 7 store": "24/7 Store",
  "ammunition store": "Ammunition Store",
  "atm": "ATM",
  "bars": "Bars",
  "car sharing": "Car Sharing",
  "chip tuning": "Chip Tuning",
  "car wash": "Car Wash",
  "clothing store": "Clothing Store",
  "electrical station": "Electrical Station",
  "family": "Family",
  "farm": "Farm",
  "gas station": "Gas Station",
  "hair salon": "Hair Salon",
  "jewellery store": "Jewellery Store",
  "juice shop": "Juice Shop",
  "law firm": "Law Firm",
  "misc/own business": "Misc/Own Business",
  "office": "Office",
  "oil well": "Oil Well",
  "organisation": "Organisation",
  "parking": "Parking",
  "pet shop": "Pet Shop",
  "service station": "Service Station",
  "tattoo parlor": "Tattoo Parlor",
  "taxi cab": "Taxi Cab",
  "warehouse": "Warehouse",
};

// Map canonical category names to their respective Google Sheet published CSV URLs.
// YOU WILL NEED TO REPLACE PLACEHOLDER URLS WITH YOUR ACTUAL PUBLISHED CSV LINKS.
const SHEET_URLS: { [key: string]: string } = {
  "24 7 store": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=81154121&single=true&output=csv", // Original URL for 24/7
  "ammunition store": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=536670718&single=true&output=csv",
  "atm": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1896199672&single=true&output=csv",
  "bars": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=554665436&single=true&output=csv",
  "car sharing": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1677731615&single=true&output=csv",
  "chip tuning": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=2124493753&single=true&output=csv",
  "car wash": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1560289993&single=true&output=csv",
  "clothing store": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1115970352&single=true&output=csv",
  "electrical station": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=890789305&single=true&output=csv",
  "family": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=611727212&single=true&output=csv",
  "farm": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=693525264&single=true&output=csv",
  "gas station": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1752119158&single=true&output=csv",
  "hair salon": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=313635912&single=true&output=csv",
  "jewellery store": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1913432171&single=true&output=csv",
  "juice shop": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1340443336&single=true&output=csv",
  "law firm": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1563186625&single=true&output=csv",
  "misc/own business": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1861170946&single=true&output=csv",
  "office": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=55176013&single=true&output=csv",
  "oil well": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1090149393&single=true&output=csv",
  "organisation": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=76653452&single=true&output=csv",
  "parking": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1397100388&single=true&output=csv",
  "pet shop": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=120656855&single=true&output=csv",
  "service station": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=488626062&single=true&output=csv",
  "tattoo parlor": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1491755766&single=true&output=csv",
  "taxi cab": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=1643962212&single=true&output=csv",
  "warehouse": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJWtUxRyaZNYRVsOgc3M9sfyI1VXt5yDHJcpUaoocDTLRMm1P3nhcY_F1q8M7O2tKgz30V09pEW5EJ/pub?gid=366962962&single=true&output=csv",
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

/**
 * Normalizes text for search, converting to lowercase, removing punctuation,
 * and replacing common synonyms/abbreviations. It also handles numbers.
 * @param text The input string to normalize.
 * @returns The normalized string.
 */
const normalizeSearchText = (text: string): string => {
  if (!text) return "";
  let normalized = text.toLowerCase();

  // Step 1: Apply specific common replacements (using global flag 'g')
  // These are semantic changes that should happen early.
  normalized = normalized.replace(/24\/7/g, '24 7');
  normalized = normalized.replace(/ammo store/g, 'ammunition store');
  normalized = normalized.replace(/ammo/g, 'ammunition');
  normalized = normalized.replace(/gun store/g, 'ammunition store');
  normalized = normalized.replace(/gun/g, 'ammunition');
  normalized = normalized.replace(/temp/g, 'template'); // 'temp' to 'template' for search consistency

  // Step 2: Handle 'n' followed by a number, replacing 'n' and ensuring a space
  // Using \b for word boundary to ensure it only matches 'n' as a standalone prefix, not part of a word.
  // This must happen after semantic replacements because 'n' might be part of 'gun' or 'ammunition'.
  normalized = normalized.replace(/\bn\s*(\d+)/g, '$1'); // 'n 5' -> '5', 'n5' -> '5'

  // Step 3: Replace any sequence of non-alphanumeric characters (including hyphens, underscores, etc.)
  // with a single space. This also effectively separates "word123" into "word 123" by replacing
  // the non-alphanumeric boundary that implicitly exists.
  normalized = normalized.replace(/[^a-z0-9]+/g, " ");

  // Step 4: Consolidate multiple spaces to a single space
  normalized = normalized.replace(/\s+/g, " ");

  // Step 5: Final trim
  return normalized.trim();
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
    if (potentialCategory.split(' ').length <= 2) {
      return potentialCategory;
    }
  }

  const words = lowerCaseName.split(" ");
  if (words.length >= 2 && (words[1] === 'store' || words[1] === 'shop' || words[1] === 'station' || words[1] === 'location' || words[1] === 'access' || words[1] === 'parlor')) {
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
  return category.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};


/**
 * The main application component for Lifeinvader templates.
 * Fetches data from a Google Sheet, categorizes it, and provides search and filter functionality.
 */
export default function App() {
  const [templates, setTemplates] = useState<Template[]>([]);
  // allFetchedTemplates stores data from ALL categories for global search
  const [allFetchedTemplates, setAllFetchedTemplates] = useState<Template[]>([]);
  // Initialize categories with ONLY the hardcoded sheet categories formatted for display
  const [categories, setCategories] = useState<string[]>(
    CANONICAL_CATEGORIES.map(formatCategoryDisplayName)
  );
  // Set initial active category to the first one in the list, or a default if none exist
  const [activeCategory, setActiveCategory] = useState(
    CANONICAL_CATEGORIES.length > 0 ? formatCategoryDisplayName(CANONICAL_CATEGORIES[0]) : ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const papaScriptLoaded = useRef(false);

  useEffect(() => {
    const loadPapaParseScript = () => {
      if (papaScriptLoaded.current || (window as any).Papa) {
        papaScriptLoaded.current = true;
        return Promise.resolve();
      }

      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js";
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

        if (typeof (window as any).Papa === 'undefined') {
          throw new Error("PapaParse is still not defined after script load.");
        }
        const Papa = (window as any).Papa;

        const parsed = Papa.parse(csvText, { header: false, skipEmptyLines: true });
        const rows: any[] = parsed.data;

        const data = rows.map((row) => {
          const originalName = (row[0] || "").trim();
          const originalDescription = (row[1] || "").trim();
          let originalType = (row[2] || "").trim();

          // Specific fix for "Office" category: if original type is empty, set it to "Office"
          if (canonicalCat === "office" && !originalType) {
            originalType = "Office";
          }
          
          return {
            name: originalName,
            description: originalDescription,
            type: originalType,
            normalizedName: normalizeSearchText(originalName),
            normalizedDescription: normalizeSearchText(originalDescription),
            normalizedType: normalizeSearchText(originalType),
            category: canonicalCat,
            displayCategory: formatCategoryDisplayName(canonicalCat),
          };
        }).filter(t => t.name !== ''); // Filter out any entries that ended up with an empty name

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
      const allCategoryUrls = CANONICAL_CATEGORIES.map(cat => ({
        url: SHEET_URLS[cat],
        canonicalCat: cat
      })).filter(item => item.url && !item.url.startsWith("YOUR_"));


      for (const { url, canonicalCat } of allCategoryUrls) {
        fetchPromises.push(fetchAndProcessCSV(url, canonicalCat));
      }

      // Execute all fetch operations concurrently
      const results = await Promise.all(fetchPromises);

      // Consolidate results for allFetchedTemplates
      results.forEach(res => allTemplatesData.push(...res));
      setAllFetchedTemplates(allTemplatesData);

      // Filter for the initially active category from the fully loaded data
      const initialFilteredTemplates = allTemplatesData.filter(t =>
        t.displayCategory === activeCategory
      );
      setTemplates(initialFilteredTemplates);

      setLoading(false);
    };

    initializeData();
  }, []); // Run once on mount to load all data

  // Effect to update `templates` when `activeCategory` changes (when search is empty)
  useEffect(() => {
    if (!searchQuery && allFetchedTemplates.length > 0) {
      const categoryFiltered = allFetchedTemplates.filter(t =>
        t.displayCategory === activeCategory
      );
      setTemplates(categoryFiltered);
    }
  }, [activeCategory, allFetchedTemplates, searchQuery]);


  const filteredTemplates = useMemo(() => {
    const normalizedSearchQuery = normalizeSearchText(searchQuery);

    if (normalizedSearchQuery === "") {
      // Default to active category if search is empty
      return templates;
    } else {
      // Identify a potential implied category from the search query
      let impliedCategoryCanonical: string | null = null;
      for (const canonicalCat of CANONICAL_CATEGORIES) {
        const normalizedCanonicalCat = normalizeSearchText(canonicalCat);
        // Check if the search query starts with or is exactly the category name
        if (normalizedSearchQuery.startsWith(normalizedCanonicalCat) || normalizedSearchQuery === normalizedCanonicalCat) {
          impliedCategoryCanonical = canonicalCat;
          break;
        }
      }

      // Split the normalized search query into individual terms for keyword matching
      const searchTerms = normalizedSearchQuery.split(' ').filter(term => term.length > 0);

      // Perform the keyword match on all fetched templates
      const allMatches = allFetchedTemplates.filter((t) => {
        // Only use the normalized name for searching
        const normalizedNameForSearch = t.normalizedName;
        
        // Check if every search term is included as a whole word/number
        const matchesSearch = searchTerms.every(term => {
          // Escape special characters in the term for regex
          const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          // Create a regex to match the term as a whole word/number (case-insensitive due to prior normalization)
          const regex = new RegExp(`\\b${escapedTerm}\\b`, 'i');
          return regex.test(normalizedNameForSearch);
        });
        return matchesSearch;
      });

      if (impliedCategoryCanonical) {
        // If an implied category is found, separate matches into prioritized and secondary
        const prioritizedResults = allMatches.filter(t => t.category === impliedCategoryCanonical);
        const secondaryResults = allMatches.filter(t => t.category !== impliedCategoryCanonical);
        return [...prioritizedResults, ...secondaryResults];
      } else {
        // If no implied category, just return all global matches
        return allMatches;
      }
    }
  }, [templates, allFetchedTemplates, searchQuery, activeCategory]);

  const handleCopy = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy using navigator.clipboard:', err);
        copyToClipboardFallback(text);
      });
    } else {
      copyToClipboardFallback(text);
    }
  };

  const copyToClipboardFallback = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback: Unable to copy text:', err);
    }
    document.body.removeChild(textarea);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 font-inter text-gray-800 p-4 sm:p-6 md:p-8">
      <main className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-100">
        <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-red-800 to-red-900 to-red-900 drop-shadow-lg py-3 rounded-xl">
          Lifeinvader Templates
        </h1>

        <div className="mb-8 flex justify-center px-2">
          <input
            type="text"
            placeholder="Search all templates by name, description, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-2xl p-4 rounded-full border border-gray-300 focus:outline-none focus:ring-4 focus:ring-red-200 shadow-lg text-lg transition-all duration-300 ease-in-out placeholder-gray-500"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10 px-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSearchQuery(""); // Clear search query when changing category
              }}
              className={`px-6 py-3 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md
                ${activeCategory === cat && searchQuery === "" // Highlight only if active and no search
                  ? "bg-red-700 text-white shadow-xl ring-4 ring-red-300 hover:bg-red-800"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <section className="min-h-[400px] bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xl">
          {loading ? (
            <p className="text-gray-700 text-center py-20 text-xl animate-pulse font-medium">Loading templates, please wait...</p>
          ) : filteredTemplates.length === 0 ? (
            <p className="text-gray-500 text-center py-20 text-xl font-medium">No templates found matching your criteria.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {filteredTemplates.map((t, i) => (
                <div
                  key={i}
                  className="relative p-6 bg-gradient-to-br from-white to-gray-50 text-gray-800 border border-gray-200 rounded-xl shadow-lg hover:shadow-2xl hover:border-red-400 transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between group"
                >
                  <div className="flex-grow mb-4">
                    <h3 className="font-bold text-xl text-red-700 mb-2 leading-tight">{t.name}</h3>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">{t.description}</p>
                    {/* Made type text larger and slightly bolder */}
                    <p className="text-sm font-medium text-gray-600 italic border-t border-gray-100 pt-2">Type: {t.type}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(t.description)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-red-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all ease-out duration-300"
                    title="Copy template description to clipboard"
                  >
                    <ClipboardIcon className="w-5 h-5 text-red-600" />
                  </button>
                  <div className="mt-auto text-right">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 shadow-sm">
                      {t.displayCategory}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
