// app/values/[category]/page.tsx
"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  RefreshCcw,
  Car,
  Ship,
  Plane,
  Shirt,
  Scissors,
  Package,
} from "lucide-react"; // FIX: Added Package import

// Utility to format slugs into readable titles
const formatSlug = (slug: string) =>
  slug
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());

interface GrandRPItem {
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

const extractExtraNumber = (item: GrandRPItem): number => {
  const match = item.name.match(/Extra\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : 1000;
};

// Mapping API slugs to display names
const specialCategoryNames: Record<string, string> = {
  clothinglist: "Clothing List",
  vehicleslist: "Vehicles List", // Assuming vehicleslist exists in your Header or somewhere else
  lumitshirt: "Luminous Shirts",
  lumipants: "Luminous Pants",
  illegalitems: "Illegal Items",
  denimjacket: "Denim Jackets", // FIX: Corrected key to 'denimjacket' (singular)
  croppcollectionshirt: "Cropped Collection Shirts",
  desertscarfmask: "Desert Scarf Masks", // FIX: Added for correct heading
  bandanamask: "Bandana Masks", // FIX: Added for correct heading
  tightmask: "Tight Masks", // FIX: Added for correct heading
  snowboardermask: "Snowboarder Masks", // FIX: Added for correct heading
  motorcycles: "Motorcycles", // FIX: Added for correct heading
  bunkerhelp: "Bunker Help", // FIX: Added for correct heading
  items: "Items", // FIX: Added for correct heading if it's a top-level category
  // Assuming cars, boats, planes, helicopters are handled by formatSlug if not explicitly here
};

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const categoryObj = React.use(params);
  const category = categoryObj.category.toLowerCase();

  // States
  const [selectedMainCategory, setSelectedMainCategory] = useState(
    category === "masks" ? "desertscarfmask" : category // Default mask category
  );
  const [selectedGender, setSelectedGender] = useState<"men" | "women" | null>(
    null
  );
  const [selectedClothingSubcatSlug, setSelectedClothingSubcatSlug] = useState<
    string | null
  >(null);
  const [items, setItems] = useState<GrandRPItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<
    "value-asc" | "value-desc" | "alpha-asc" | "alpha-desc" | null
  >(null);

  // Reset states on category change
  useEffect(() => {
    setSelectedMainCategory(
      category === "masks" ? "desertscarfmask" : category
    );
    // Only reset gender/subcat for clothinglist categories if the category isn't clothinglist
    // or if the category is clothinglist but a new gender/subcat hasn't been chosen yet
    if (category !== "clothinglist") {
      setSelectedGender(null);
      setSelectedClothingSubcatSlug(null);
    }
    setItems([]);
    setSearchTerm("");
    setSortOption(null);
  }, [category]);

  // Fetch clothinglist items
  const fetchClothingItems = useCallback(
    async (gender: string, heading: string | null) => {
      if (!heading) {
        setItems([]);
        setLoading(false); // Ensure loading is false if no heading to fetch
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
        const data: GrandRPItem[] = await res.json();
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

  // Fetch general items
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
      const data: GrandRPItem[] = await res.json();

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
  }, [selectedMainCategory]); // Depend on selectedMainCategory

  useEffect(() => {
    if (category === "clothinglist") {
      if (selectedGender && selectedClothingSubcatSlug) {
        fetchClothingItems(selectedGender, selectedClothingSubcatSlug);
      } else {
        setItems([]); // Clear items when no subcategory is selected
        setLoading(false); // Explicitly set loading to false here
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
    fetchClothingItems,
    fetchGeneralItems,
  ]);

  // Filter & sort
  const filteredAndSortedItems = useMemo(() => {
    const filtered = items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (!sortOption) return filtered;
    const copy = [...filtered];
    switch (sortOption) {
      case "value-asc":
        return copy.sort(
          (a, b) =>
            (parseFloat((a.value ?? "").replace(/[^0-9.]/g, "")) || 0) -
            (parseFloat((b.value ?? "").replace(/[^0-9.]/g, "")) || 0)
        );
      case "value-desc":
        return copy.sort(
          (a, b) =>
            (parseFloat((b.value ?? "").replace(/[^0-9.]/g, "")) || 0) -
            (parseFloat((a.value ?? "").replace(/[^0-9.]/g, "")) || 0)
        );
      case "alpha-asc":
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case "alpha-desc":
        return copy.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return copy;
    }
  }, [items, searchTerm, sortOption]);

  // Header icon
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
      case "lumitshirt":
        return <Shirt className="w-16 h-16" />;
      case "lumipants":
        return <Scissors className="w-16 h-16" />;
      case "denimjacket":
        return <Shirt className="w-16 h-16" />;
      case "croppcollectionshirt":
        return <Shirt className="w-16 h-16" />;
      case "illegalitems":
        return <Package className="w-16 h-16" />;
      case "motorcycles":
        return <Car className="w-16 h-16 -scale-x-100" />;
      case "bunkerhelp":
        return <RefreshCcw className="w-16 h-16" />;
      case "items":
        return <Package className="w-16 h-16" />;
      default:
        return <RefreshCcw className="w-16 h-16" />;
    }
  };

  // Determine current header name
  const currentHeaderName =
    specialCategoryNames[selectedMainCategory.toLowerCase()] ||
    formatSlug(selectedMainCategory);
  const currentHeaderIconSlug = selectedMainCategory;

  // Clothing subcategories for display
  const clothingHeadingsForDisplay = useMemo(
    () =>
      selectedGender
        ? allClothingSubcategories.filter(
            (subcat) => subcat.gender === selectedGender
          )
        : [],
    [selectedGender]
  );

  const getSortButtonClass = (option: typeof sortOption) => `
    px-4 py-2 rounded-lg font-semibold transition
    ${
      sortOption === option
        ? "bg-blue-600 text-white shadow-lg transform scale-105"
        : "bg-gray-700 text-gray-200 hover:bg-blue-600 hover:text-white"
    }
  `;

  return (
    <div className="flex flex-col items-center mt-8 px-4 sm:px-8">
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

      {/* Clothing List Navigation */}
      {category === "clothinglist" && (
        <>
          {!selectedGender && (
            <div className="flex justify-center items-center gap-8 mb-12">
              <button
                onClick={() => {
                  setSelectedGender("men");
                  setSelectedClothingSubcatSlug(null);
                  setItems([]);
                  setSearchTerm("");
                  setSortOption(null);
                  // FIX: Removed setLoading(true) here
                }}
                className="w-48 px-8 py-6 text-2xl font-bold rounded-3xl bg-blue-600 text-white shadow-lg hover:scale-105 transition text-center"
              >
                Men
              </button>
              <button
                onClick={() => {
                  setSelectedGender("women");
                  setSelectedClothingSubcatSlug(null);
                  setItems([]);
                  setSearchTerm("");
                  setSortOption(null);
                  // FIX: Removed setLoading(true) here
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
                        setLoading(true); // FIX: Keep setLoading(true) here as a fetch is about to happen
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
          (selectedGender && selectedClothingSubcatSlug)) && (
          <div className="flex flex-col items-center w-full max-w-6xl mb-8">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4 px-5 py-3 rounded-lg w-full max-w-md bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
          (selectedGender && selectedClothingSubcatSlug)) && (
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
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/400x200/555/FFF?text=Image+Not+Found";
                    }}
                  />
                </div>
              )}
              <h3 className="text-2xl font-semibold text-blue-300 mb-2">
                {item.name}
              </h3>
              <p className="text-lg text-gray-200 mt-auto">
                Value:{" "}
                <span className="font-bold text-emerald-400">
                  {item.value || "N/A"}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
