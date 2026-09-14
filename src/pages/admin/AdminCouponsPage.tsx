import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Check, X, Calendar } from 'lucide-react';
import { Coupon } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('10');
  const [minOrderAmount, setMinOrderAmount] = useState('100');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('50');
  const [usageLimit, setUsageLimit] = useState('100');
  const [isActive, setIsActive] = useState(true);
  const [expiresAt, setExpiresAt] = useState('2026-12-31');
  const [isSaving, setIsSaving] = useState(false);

  const { success, error } = useToast();

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const data = await api.adminGetCoupons();
      setCoupons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode('PROMO' + Math.floor(10 + Math.random() * 90));
    setType('percentage');
    setValue('10');
    setMinOrderAmount('100');
    setMaxDiscountAmount('50');
    setUsageLimit('200');
    setIsActive(true);
    setExpiresAt('2026-12-31');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setType(c.type);
    setValue(c.value.toString());
    setMinOrderAmount(c.minOrderAmount ? c.minOrderAmount.toString() : '');
    setMaxDiscountAmount(c.maxDiscountAmount ? c.maxDiscountAmount.toString() : '');
    setUsageLimit(c.usageLimit ? c.usageLimit.toString() : '');
    setIsActive(c.isActive);
    setExpiresAt(c.expiresAt ? c.expiresAt.split('T')[0] : '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !value) return;

    setIsSaving(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        type,
        value: parseFloat(value) || 0,
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : undefined,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : undefined,
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      };

      if (editingCoupon) {
        await api.adminUpdateCoupon(editingCoupon.id, payload);
        success('Promotional coupon updated.');
      } else {
        await api.adminCreateCoupon(payload);
        success('New coupon activated.');
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      error(err.message || 'Failed to persist coupon.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (!confirm(`Delete promo code "${couponCode}"?`)) return;
    try {
      await api.adminDeleteCoupon(id);
      success(`Coupon "${couponCode}" deleted.`);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      error(err.message || 'Failed to remove coupon.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white">Promotions & Coupons</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure seasonal vouchers, tiered discount campaigns, and cart thresholds.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Promo Voucher</span>
        </button>
      </div>

      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-400">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">No active coupon codes registered.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-neutral-400 uppercase tracking-wider text-[10px] bg-neutral-900/60 border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Benefit</th>
                  <th className="py-3 px-4">Min. Spend</th>
                  <th className="py-3 px-4">Redemptions</th>
                  <th className="py-3 px-4">Expiration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{c.code}</td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {c.type === 'percentage' ? `${c.value}% Off` : `$${c.value.toFixed(2)} Off`}
                    </td>
                    <td className="py-3 px-4 text-neutral-400">
                      {c.minOrderAmount ? `$${c.minOrderAmount}` : 'No minimum'}
                    </td>
                    <td className="py-3 px-4 text-neutral-300">
                      {c.usedCount} / {c.usageLimit || '∞'}
                    </td>
                    <td className="py-3 px-4 text-neutral-400">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.isActive
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-neutral-400 hover:text-amber-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.code)}
                          className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingCoupon ? 'Edit Voucher' : 'Create Voucher Code'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Voucher Code *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. LUXURY20"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white uppercase font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Min Order Spend ($)
                  </label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Max Discount Limit ($)
                  </label>
                  <input
                    type="number"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    placeholder="None"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Redemption Cap
                  </label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="100"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-neutral-700 text-amber-500 focus:ring-amber-400"
                />
                <span>Active for immediate client checkout</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 bg-white text-neutral-950 text-xs font-bold rounded-lg hover:bg-neutral-200 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
