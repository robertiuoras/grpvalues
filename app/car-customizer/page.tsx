"use client";

import React, { useState } from "react";
import { useLanguage } from "../../lib/languageContext";
import { Car, Palette, Settings, Download, RotateCcw } from "lucide-react";

// Car models based on real-life cars (GTA V style)
const carModels = [
  {
    id: "adder",
    name: "Adder",
    realLife: "Bugatti Veyron",
    category: "Super",
    basePrice: 1000000,
    image: "/images/cars/adder.jpg",
    colors: ["Red", "Blue", "Black", "White", "Silver", "Gold"],
    parts: ["Stock", "Sport", "Racing", "Custom"]
  },
  {
    id: "zentorno",
    name: "Zentorno",
    realLife: "Lamborghini Sesto Elemento",
    category: "Super",
    basePrice: 725000,
    image: "/images/cars/zentorno.jpg",
    colors: ["Red", "Blue", "Black", "White", "Silver", "Gold"],
    parts: ["Stock", "Sport", "Racing", "Custom"]
  },
  {
    id: "entityxf",
    name: "Entity XF",
    realLife: "Koenigsegg CCX",
    category: "Super",
    basePrice: 795000,
    image: "/images/cars/entityxf.jpg",
    colors: ["Red", "Blue", "Black", "White", "Silver", "Gold"],
    parts: ["Stock", "Sport", "Racing", "Custom"]
  },
  {
    id: "infernus",
    name: "Infernus",
    realLife: "Lamborghini Gallardo",
    category: "Super",
    basePrice: 440000,
    image: "/images/cars/infernus.jpg",
    colors: ["Red", "Blue", "Black", "White", "Silver", "Gold"],
    parts: ["Stock", "Sport", "Racing", "Custom"]
  },
  {
    id: "banshee",
    name: "Banshee",
    realLife: "Dodge Viper",
    category: "Sports",
    basePrice: 105000,
    image: "/images/cars/banshee.jpg",
    colors: ["Red", "Blue", "Black", "White", "Silver", "Gold"],
    parts: ["Stock", "Sport", "Racing", "Custom"]
  },
  {
    id: "sultan",
    name: "Sultan",
    realLife: "Subaru Impreza WRX",
    category: "Sports",
    basePrice: 12000,
    image: "/images/cars/sultan.jpg",
    colors: ["Red", "Blue", "Black", "White", "Silver", "Gold"],
    parts: ["Stock", "Sport", "Racing", "Custom"]
  }
];

export default function CarCustomizerPage() {
  const { t } = useLanguage();
  const [selectedCar, setSelectedCar] = useState(carModels[0]);
  const [selectedColor, setSelectedColor] = useState("Red");
  const [selectedPart, setSelectedPart] = useState("Stock");
  const [customizations, setCustomizations] = useState({
    color: "Red",
    part: "Stock",
    spoiler: false,
    neon: false,
    tint: "None"
  });

  const handleCarSelect = (car: typeof carModels[0]) => {
    setSelectedCar(car);
    setCustomizations(prev => ({
      ...prev,
      color: car.colors[0],
      part: car.parts[0]
    }));
  };

  const handleCustomizationChange = (key: string, value: string | boolean) => {
    setCustomizations(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const calculateTotalPrice = () => {
    let total = selectedCar.basePrice;
    
    // Add part costs
    const partCosts = {
      "Stock": 0,
      "Sport": 50000,
      "Racing": 100000,
      "Custom": 200000
    };
    
    total += partCosts[selectedPart as keyof typeof partCosts] || 0;
    
    // Add customization costs
    if (customizations.spoiler) total += 25000;
    if (customizations.neon) total += 15000;
    if (customizations.tint !== "None") total += 5000;
    
    return total;
  };

  const resetCustomizations = () => {
    setCustomizations({
      color: selectedCar.colors[0],
      part: selectedCar.parts[0],
      spoiler: false,
      neon: false,
      tint: "None"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Car className="w-10 h-10" />
            {t('car_customizer.title')}
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            {t('car_customizer.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Car Selection */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/30">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Car className="w-6 h-6" />
              {t('car_customizer.select_car')}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {carModels.map((car) => (
                <button
                  key={car.id}
                  onClick={() => handleCarSelect(car)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedCar.id === car.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">{car.name}</h3>
                    <p className="text-sm text-gray-600">{car.realLife}</p>
                    <p className="text-sm text-gray-500">{car.category}</p>
                    <p className="text-sm font-medium text-green-600">
                      ${car.basePrice.toLocaleString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Customization Options */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/30">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              {t('car_customizer.customize')}
            </h2>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('car_customizer.color')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {selectedCar.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleCustomizationChange('color', color)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      customizations.color === color
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div 
                      className="w-full h-8 rounded"
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                    <span className="text-xs text-gray-600 mt-1">{color}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Part Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('car_customizer.parts')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {selectedCar.parts.map((part) => (
                  <button
                    key={part}
                    onClick={() => handleCustomizationChange('part', part)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      customizations.part === part
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-sm font-medium">{part}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Customizations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  {t('car_customizer.spoiler')}
                </label>
                <input
                  type="checkbox"
                  checked={customizations.spoiler}
                  onChange={(e) => handleCustomizationChange('spoiler', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  {t('car_customizer.neon')}
                </label>
                <input
                  type="checkbox"
                  checked={customizations.neon}
                  onChange={(e) => handleCustomizationChange('neon', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('car_customizer.tint')}
                </label>
                <select
                  value={customizations.tint}
                  onChange={(e) => handleCustomizationChange('tint', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="None">{t('car_customizer.no_tint')}</option>
                  <option value="Light">{t('car_customizer.light_tint')}</option>
                  <option value="Medium">{t('car_customizer.medium_tint')}</option>
                  <option value="Dark">{t('car_customizer.dark_tint')}</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={resetCustomizations}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {t('car_customizer.reset')}
              </button>
              <button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t('car_customizer.save')}
              </button>
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="mt-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/30">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              {t('car_customizer.total_price')}
            </h3>
            <div className="text-4xl font-bold text-green-600 mb-2">
              ${calculateTotalPrice().toLocaleString()}
            </div>
            <p className="text-gray-600">
              {t('car_customizer.price_note')}
            </p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm">ℹ</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                {t('car_customizer.privacy_notice_title')}
              </h4>
              <p className="text-sm text-blue-800">
                {t('car_customizer.privacy_notice_text')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
