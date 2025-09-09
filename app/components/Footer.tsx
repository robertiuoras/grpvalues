"use client";

import React from "react";
import { useLanguage } from "../../lib/languageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 border-t border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-blue-400 mb-4">
            GRP Database
          </h3>
          <p className="text-gray-300 text-lg mb-6 max-w-3xl mx-auto">
            {t('footer.description')}
          </p>
        </div>

        {/* Trademark Information */}
        <div className="border-t border-gray-700 pt-6 mt-6">
          <div className="text-center text-sm text-gray-400 space-y-2">
            <p>
              {t('footer.grand_roleplay_trademark')}
            </p>
            <p>
              {t('footer.gta_v_trademark')}
            </p>
            <p className="text-gray-500">
              {t('footer.disclaimer')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
