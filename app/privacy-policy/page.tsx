"use client";

import React from "react";
import { useLanguage } from "../../lib/languageContext";

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/30">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            {t('privacy.title')}
          </h1>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {t('privacy.data_collection.title')}
              </h2>
              <p className="mb-4">
                {t('privacy.data_collection.description')}
              </p>
              <p className="mb-4">
                {t('privacy.data_collection.analytics')}
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>{t('privacy.data_collection.browser_type')}</li>
                <li>{t('privacy.data_collection.pages_visited')}</li>
                <li>{t('privacy.data_collection.approximate_location')}</li>
              </ul>
              <p className="mt-4">
                {t('privacy.data_collection.ip_addresses')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {t('privacy.cookies.title')}
              </h2>
              <p>
                {t('privacy.cookies.description')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {t('privacy.data_sharing.title')}
              </h2>
              <p>
                {t('privacy.data_sharing.description')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {t('privacy.contact.title')}
              </h2>
              <p>
                {t('privacy.contact.description')}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
