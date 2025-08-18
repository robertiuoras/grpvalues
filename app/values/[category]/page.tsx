"use client";

import React, { useState, useEffect } from "react";
import { RefreshCcw, Car, Ship, Plane } from "lucide-react";

interface GrandRPItem {
  name: string;
  value: string;
  sheetName: string;
  imageUrl?: string;
}

const maskSlugToCategory: Record<string, string> = {
  desertscarfmask: "desertscarfmask",
  bandanamasks: "bandanamask",
  tightmasks: "tightmask",
  snowboardermasks: "snowboardermask",
};

async function fetchCategoryValues(
  categorySlug: string
): Promise<GrandRPItem[]> {
  try {
    const response = await fetch(`/api/values/${categorySlug}`);
    if (!response.ok) {
      if (response.status === 404) return [];
      throw new Error(
        `HTTP error ${response.status} for category ${categorySlug}`
      );
    }
    return await response.json();
  } catch (e) {
    console.error(`Error fetching data for ${categorySlug}:`, e);
    return [];
  }
}

function extractExtraNumber(item: GrandRPItem): number {
  const match = item.name.match(/Extra\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : 1000;
}

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = params.category.toLowerCase();

  const maskCategories = [
    {
      slug: "desertscarfmask",
      name: "Desert Scarf Masks",
      description: "Browse current market values for Desert Scarf Masks.",
    },
    {
      slug: "bandanamasks",
      name: "Bandana Masks",
      description: "Browse current market values for Bandana Masks.",
    },
    {
      slug: "tightmasks",
      name: "Tight Masks",
      description: "Browse current market values for Tight Masks.",
    },
    {
      slug: "snowboardermasks",
      name: "Snowboarder Masks",
      description: "Browse current market values for Snowboarder Masks.",
    },
  ];

  const shouldShowMaskSubNav =
    maskCategories.some((mask) => mask.slug === category) ||
    category === "masks";

  const [selectedMask, setSelectedMask] = useState(
    category === "masks" ? "desertscarfmask" : category
  );
  const [items, setItems] = useState<GrandRPItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (category === "masks") setSelectedMask("desertscarfmask");
    else setSelectedMask(category);
  }, [category]);

  useEffect(() => {
    async function loadCategoryItems() {
      setLoading(true);
      setError(null);
      try {
        const categoryId = maskSlugToCategory[selectedMask] || selectedMask;
        const data = await fetchCategoryValues(categoryId);

        const sorted = data.sort(
          (a, b) => extractExtraNumber(a) - extractExtraNumber(b)
        );
        setItems(sorted);
      } catch {
        setError(`Failed to load items for ${selectedMask}.`);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    if (selectedMask) loadCategoryItems();
  }, [selectedMask]);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "cars":
        return <Car className="w-8 h-8" />;
      case "boats":
        return <Ship className="w-8 h-8" />;
      case "planes":
      case "helicopters":
        return <Plane className="w-8 h-8" />;
      default:
        if (maskCategories.some((m) => m.slug === slug))
          return (
            <img
              src="https://placehold.co/40x40/FF7F50/FFF?text=Mask"
              alt="Mask Icon"
              className="w-12 h-12 object-contain"
            />
          );
        return <RefreshCcw className="w-8 h-8" />;
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const headerName =
    maskCategories.find((m) => m.slug === selectedMask)?.name || selectedMask;
  const paragraphDescription =
    maskCategories.find((m) => m.slug === selectedMask)?.description ||
    `Browse the current market values for Grand RP ${headerName}.`;

  return (
    <div className="flex flex-col items-center mt-8">
      <h1 className="flex items-center justify-center gap-3 text-5xl font-extrabold text-blue-400 mb-8 drop-shadow-lg capitalize text-center">
        {getCategoryIcon(selectedMask)} {headerName}
      </h1>

      {shouldShowMaskSubNav && (
        <div className="flex flex-wrap justify-center gap-5 mb-10 p-5 bg-gray-800 rounded-xl shadow-inner">
          {maskCategories.map((mask) => (
            <button
              key={mask.slug}
              onClick={() => setSelectedMask(mask.slug)}
              className={`px-7 py-3 rounded-xl text-lg font-semibold transition-all duration-300 ${
                selectedMask === mask.slug
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600 hover:scale-105"
              }`}
            >
              {mask.name}
            </button>
          ))}
        </div>
      )}

      <p className="text-xl text-gray-300 mb-8 text-center max-w-2xl">
        {paragraphDescription}
      </p>

      <input
        type="text"
        placeholder="Search items..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-8 px-5 py-3 rounded-lg w-full max-w-md bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading && (
        <div className="text-center text-gray-400">
          Loading {headerName.toLowerCase()} values...
        </div>
      )}
      {error && <div className="text-center text-red-400">{error}</div>}
      {!loading && filteredItems.length === 0 && !error && (
        <div className="text-center text-gray-400">
          No {headerName.toLowerCase()} values found.
        </div>
      )}

      {!loading && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
          {filteredItems.map((item) => (
            <div
              key={item.name}
              className="bg-gray-800 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-700 text-center flex flex-col items-center"
            >
              {selectedMask !== "cars" && item.imageUrl && (
                <div className="mb-6 flex justify-center items-center w-64 h-64 bg-gray-700 rounded-lg overflow-hidden p-2">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-contain"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://placehold.co/400x200/555/FFF?text=Image+Not+Found")
                    }
                  />
                </div>
              )}
              <h3 className="text-2xl font-semibold text-blue-300 not-italic mb-2">
                {item.name}
              </h3>
              <p className="text-lg text-gray-200 mt-auto">
                Value:{" "}
                <span className="font-bold text-emerald-400">{item.value}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
