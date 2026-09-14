import React, { useState, useEffect } from 'react';
import { Save, Store, Truck, ShieldCheck, Mail, Globe } from 'lucide-react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    storeName: 'Baggio',
    supportEmail: 'concierge@baggio.com',
    supportPhone: '+1 (212) 555-0199',
    currency: 'USD',
    taxRate: 8.5,
    shippingFee: 15.0,
    freeShippingThreshold: 150.0,
    enableCOD: true,
    enableCardPayment: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    api.getSettings()
      .then((data) => {
        setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setSettings((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setSettings((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.adminUpdateSettings(settings);
      success('Commerce & logistics settings saved.');
    } catch (err: any) {
      error(err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-neutral-400">Loading parameters...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h2 className="text-xl font-serif font-bold text-white">Atelier Parameters & Settings</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure currency standards, logistics thresholds, taxes, and settlement rails.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand & Contact */}
        <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-400" />
            <span>Storefront Brand Identity</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Storefront Title
            </label>
            <input
              type="text"
              name="storeName"
              value={settings.storeName}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Concierge Email
            </label>
            <input
              type="email"
              name="supportEmail"
              value={settings.supportEmail}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Concierge Phone
            </label>
            <input
              type="text"
              name="supportPhone"
              value={settings.supportPhone}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Logistics & Shipping Fees */}
        <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Courier & Taxation</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Sales Tax Percentage (%)
            </label>
            <input
              type="number"
              step="0.1"
              name="taxRate"
              value={settings.taxRate}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Standard Courier Shipping Fee ($)
            </label>
            <input
              type="number"
              step="0.01"
              name="shippingFee"
              value={settings.shippingFee}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Complimentary Shipping Threshold ($)
            </label>
            <input
              type="number"
              step="1"
              name="freeShippingThreshold"
              value={settings.freeShippingThreshold}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4 md:col-span-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Settlement Channels</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                name="enableCOD"
                checked={settings.enableCOD}
                onChange={handleChange}
                className="rounded border-neutral-700 text-amber-500 focus:ring-amber-400"
              />
              <div>
                <span className="text-xs font-bold text-white block">Cash on Delivery (COD)</span>
                <span className="text-[11px] text-neutral-400">
                  Clients pay upon physical courier handover and parcel inspection.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                name="enableCardPayment"
                checked={settings.enableCardPayment}
                onChange={handleChange}
                className="rounded border-neutral-700 text-amber-500 focus:ring-amber-400"
              />
              <div>
                <span className="text-xs font-bold text-white block">Credit / Debit Card (Stripe)</span>
                <span className="text-[11px] text-neutral-400">
                  Instant card authorization via secure 256-bit gateway.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Data & Catalog Management */}
        <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Store Catalog & Data Management
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Manage initial database content, seed catalog data, or purge all records.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Import the curated sample catalog (categories, products, banners, coupons)?')) {
                  try {
                    const res = await api.adminSeedSampleCatalog();
                    success(res.message);
                  } catch (err: any) {
                    error(err.message || 'Failed to import sample catalog.');
                  }
                }
              }}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-colors border border-neutral-700"
            >
              Import Sample Catalog
            </button>

            <button
              type="button"
              onClick={async () => {
                if (window.confirm('CRITICAL: Purge all products, categories, orders, reviews, banners, and coupons? This action cannot be undone.')) {
                  try {
                    const res = await api.adminClearAllData();
                    success(res.message);
                  } catch (err: any) {
                    error(err.message || 'Failed to clear store data.');
                  }
                }
              }}
              className="px-4 py-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs font-semibold rounded-xl transition-colors border border-red-800/60"
            >
              Purge All Store Data
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
