"use client";

import Link from "next/link";
import { Car, Ship, Plane, Package, Glasses } from "lucide-react";

interface CategoryCard {
  name: string;
  path: string;
  description: string;
  icon: React.ReactNode;
}

export default function HomePage() {
  const categories: CategoryCard[] = [
    {
      name: "Cars",
      path: "/vehicles/cars",
      description: "Find market values for all types of cars.",
      icon: <Car size={40} className="text-blue-400" />,
    },
    {
      name: "Boats",
      path: "/vehicles/boats",
      description: "Check values for various boats and yachts.",
      icon: <Ship size={40} className="text-teal-400" />,
    },
    {
      name: "Planes",
      path: "/vehicles/planes",
      description: "Discover the prices of private planes.",
      icon: <Plane size={40} className="text-emerald-400" />,
    },
    {
      name: "Helicopters",
      path: "/vehicles/helicopters",
      description: "Browse values for different helicopter models.",
      icon: <Plane size={40} className="text-purple-400 rotate-90" />,
    },
    {
      name: "Clothing List",
      path: "/vehicles/clothinglist",
      description: "Explore the market values for various clothing items.",
      icon: <Package size={40} className="text-pink-400" />,
    },
    {
      name: "Desert Scarf Mask",
      path: "/vehicles/desertscarfmask",
      description: "Check values for desert scarf masks.",
      icon: <Glasses size={40} className="text-orange-400" />,
    },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-5xl font-extrabold text-blue-400 mb-6 drop-shadow-lg text-center">
        Welcome to Grand RP Values
      </h1>
      <p className="text-xl text-gray-300 mb-12 text-center max-w-3xl">
        Select a category below to explore the current market values.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={category.path}
            className="flex items-center p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700
                       hover:bg-gray-700 hover:shadow-2xl transition-all duration-300 cursor-pointer"
          >
            <div className="mr-4">{category.icon}</div>
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-white">{category.name}</h2>
              <p className="text-gray-300 text-sm">{category.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
