import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Tag,
  Star,
} from 'lucide-react';
import { Product, Category } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminProductsPageProps {
  navigate: (path: string) => void;
}

export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({ navigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { success, error } = useToast();

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.adminGetProducts({
          search: search || undefined,
          categoryId: selectedCategory || undefined,
          limit: 100,
        }),
        api.getCategories(),
      ]);
      setProducts(prodRes.products || []);
      setCategories(catRes || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    setIsDeleting(id);
    try {
      await api.adminDeleteProduct(id);
      success(`Product "${name}" deleted.`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      error(err.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (stockFilter === 'low') return p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold;
    if (stockFilter === 'out') return p.stockQuantity === 0;
    if (stockFilter === 'in') return p.stockQuantity > p.lowStockThreshold;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white">Product Catalog</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage articles, inventory levels, variants, and pricing structures.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="px-4 py-2.5 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Article</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, SKU, or tags..."
            className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 text-xs text-white rounded-xl focus:outline-none focus:border-amber-400"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 text-xs text-white rounded-xl focus:outline-none focus:border-amber-400"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 text-xs text-white rounded-xl focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Inventory</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock Alerts</option>
            <option value="out">Out of Stock</option>
          </select>

          <button
            onClick={fetchProducts}
            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 rounded-xl"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-400">Loading catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            No products match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-neutral-400 uppercase tracking-wider text-[10px] bg-neutral-900/60 border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredProducts.map((p) => {
                  const img = p.images?.find((i) => i.isPrimary)?.url || p.images?.[0]?.url || '';
                  const cat = categories.find((c) => c.id === p.categoryId);
                  const isOut = p.stockQuantity === 0;
                  const isLow = !isOut && p.stockQuantity <= p.lowStockThreshold;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 bg-neutral-900 rounded-lg overflow-hidden shrink-0 border border-neutral-800">
                            {img ? (
                              <img
                                src={img}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-700">
                                —
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white truncate max-w-xs">{p.name}</p>
                            <p className="text-[11px] text-neutral-400">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-400">{p.sku}</td>
                      <td className="py-3 px-4 text-neutral-300">{cat?.name || 'Unassigned'}</td>
                      <td className="py-3 px-4 font-semibold text-white">
                        <div>
                          <span>${(p.salePrice ?? p.regularPrice).toFixed(2)}</span>
                          {p.salePrice && (
                            <span className="text-[10px] text-neutral-500 line-through ml-1.5">
                              ${p.regularPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                            Out of Stock (0)
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            Low ({p.stockQuantity})
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">
                            {p.stockQuantity} units
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/product/${p.id}`)}
                            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                            title="Preview in Store"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/products/${p.id}`)}
                            className="p-1.5 text-neutral-400 hover:text-amber-400 transition-colors"
                            title="Edit Article"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={isDeleting === p.id}
                            className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors disabled:opacity-30"
                            title="Delete Article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
