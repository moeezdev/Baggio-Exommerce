import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Package,
  Plus,
  Minus,
  Check,
  Save,
  Search,
  Filter,
} from 'lucide-react';
import { Product } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

export const AdminInventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState({ totalStockUnits: 0, lowStockCount: 0, outOfStockCount: 0 });
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Map of modified stock values: { [productId]: number }
  const [stockEdits, setStockEdits] = useState<{ [id: string]: number }>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const { success, error } = useToast();

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const data = await api.adminGetInventory();
      setProducts(data.products || []);
      setSummary(data.summary);
      const initialMap: { [id: string]: number } = {};
      (data.products || []).forEach((p: Product) => {
        initialMap[p.id] = p.stockQuantity;
      });
      setStockEdits(initialMap);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = (productId: string, val: number) => {
    setStockEdits((prev) => ({
      ...prev,
      [productId]: Math.max(0, val),
    }));
  };

  const handleSaveStock = async (product: Product) => {
    const newQty = stockEdits[product.id];
    if (newQty === undefined) return;
    setSavingId(product.id);
    try {
      await api.adminUpdateStock(product.id, {
        stockQuantity: newQty,
        lowStockThreshold: product.lowStockThreshold,
      });
      success(`Inventory updated for ${product.name}`);
      fetchInventory();
    } catch (err: any) {
      error(err.message || 'Failed to update stock');
    } finally {
      setSavingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'low') return p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold;
    if (filter === 'out') return p.stockQuantity === 0;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white">Inventory Reserve Control</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Monitor real-time warehouse unit quantities, low-stock triggers, and restocks.
          </p>
        </div>
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl">
          <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
            Total Units in Vault
          </span>
          <p className="text-2xl font-bold text-white mt-1">{summary.totalStockUnits}</p>
        </div>

        <div
          onClick={() => setFilter('low')}
          className={`p-5 bg-neutral-950 border rounded-2xl cursor-pointer transition-colors ${
            filter === 'low' ? 'border-amber-500 bg-amber-500/5' : 'border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-1">{summary.lowStockCount}</p>
        </div>

        <div
          onClick={() => setFilter('out')}
          className={`p-5 bg-neutral-950 border rounded-2xl cursor-pointer transition-colors ${
            filter === 'out' ? 'border-rose-500 bg-rose-500/5' : 'border-neutral-800'
          }`}
        >
          <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
            Exhausted Stock
          </span>
          <p className="text-2xl font-bold text-rose-400 mt-1">{summary.outOfStockCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search article SKU or title..."
            className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 text-xs text-white rounded-xl focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filter === 'all' ? 'bg-white text-neutral-950' : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filter === 'low' ? 'bg-amber-400 text-neutral-950' : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            Low Stock Only
          </button>
          <button
            onClick={() => setFilter('out')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filter === 'out' ? 'bg-rose-500 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-400">Loading stock registers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-neutral-400 uppercase tracking-wider text-[10px] bg-neutral-900/60 border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Threshold</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Quick Adjust</th>
                  <th className="py-3 px-4 text-right">Commit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredProducts.map((p) => {
                  const currentEdit = stockEdits[p.id] ?? p.stockQuantity;
                  const isModified = currentEdit !== p.stockQuantity;
                  const isOut = currentEdit === 0;
                  const isLow = !isOut && currentEdit <= p.lowStockThreshold;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block truncate max-w-xs">{p.name}</span>
                        <span className="text-[11px] text-neutral-400">{p.brand}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-400">{p.sku}</td>
                      <td className="py-3 px-4 text-neutral-400">Alert at ≤ {p.lowStockThreshold}</td>
                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                            Depleted
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            Warning ({currentEdit})
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">{currentEdit} on hand</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStockChange(p.id, currentEdit - 1)}
                            className="p-1 rounded bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            value={currentEdit}
                            onChange={(e) =>
                              handleStockChange(p.id, parseInt(e.target.value, 10) || 0)
                            }
                            className="w-16 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-center text-xs text-white font-mono"
                          />
                          <button
                            onClick={() => handleStockChange(p.id, currentEdit + 1)}
                            className="p-1 rounded bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleSaveStock(p)}
                          disabled={!isModified || savingId === p.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition-colors ${
                            isModified
                              ? 'bg-amber-400 text-neutral-950 hover:bg-amber-300 shadow-sm'
                              : 'bg-neutral-900 text-neutral-600 cursor-not-allowed'
                          }`}
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{savingId === p.id ? 'Saving...' : 'Save'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
