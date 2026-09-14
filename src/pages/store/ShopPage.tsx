import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Product, Category } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { ProductCard } from '../../components/store/ProductCard.tsx';
import { formatPrice } from '../../utils/currency.ts';

interface ShopPageProps {
  navigate: (path: string) => void;
  initialParams?: {
    search?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    featured?: string;
    isNew?: string;
    bestSeller?: string;
    [key: string]: any;
  };
}

export const ShopPage: React.FC<ShopPageProps> = ({ navigate, initialParams }) => {
  const params = initialParams || {};
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState(params.search || '');
  const [selectedCategory, setSelectedCategory] = useState(params.categoryId || '');
  const [minPrice, setMinPrice] = useState(params.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(params.maxPrice || '');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [availability, setAvailability] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [sort, setSort] = useState(
    params.sort || (params.bestSeller === 'true' ? 'best-selling' : params.isNew === 'true' ? 'newest' : 'featured')
  );

  // Fetch Categories once
  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch Products based on backend capabilities
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getProducts({
        search: search.trim() || undefined,
        categoryId: selectedCategory || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sort,
        page: currentPage,
        limit: 12,
      });

      let fetched = res.products || [];

      // Client-side refinements for Size, Color, Availability if needed
      if (selectedSize) {
        fetched = fetched.filter((p) =>
          p.variants?.some((v) => v.size?.toLowerCase() === selectedSize.toLowerCase())
        );
      }

      if (selectedColor) {
        fetched = fetched.filter((p) =>
          p.variants?.some((v) => v.color?.toLowerCase() === selectedColor.toLowerCase())
        );
      }

      if (availability === 'in_stock') {
        fetched = fetched.filter((p) => p.stockQuantity > 0);
      } else if (availability === 'out_of_stock') {
        fetched = fetched.filter((p) => p.stockQuantity === 0);
      }

      setProducts(fetched);
      setTotalProducts(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Fetch shop products failed:', err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, minPrice, maxPrice, sort, currentPage, selectedSize, selectedColor, availability]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Extract available sizes & colors from current catalog
  const { availableSizes, availableColors } = useMemo(() => {
    const sizeSet = new Set<string>();
    const colorSet = new Set<string>();
    products.forEach((p) => {
      p.variants?.forEach((v) => {
        if (v.size) sizeSet.add(v.size);
        if (v.color) colorSet.add(v.color);
      });
    });
    return {
      availableSizes: Array.from(sizeSet),
      availableColors: Array.from(colorSet),
    };
  }, [products]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedSize('');
    setSelectedColor('');
    setAvailability('all');
    setSort('featured');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    search ||
      selectedCategory ||
      minPrice ||
      maxPrice ||
      selectedSize ||
      selectedColor ||
      availability !== 'all' ||
      sort !== 'featured'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 select-none">
      {/* 17. TOP SECTION: SHOP ALL */}
      <div className="text-center max-w-2xl mx-auto mb-10 pb-6 border-b border-neutral-200">
        <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400">
          The Baggio Collection
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-wider uppercase text-neutral-950 mt-1">
          Shop All
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 font-light mt-2 max-w-md mx-auto">
          Handcrafted Italian leather accessories, horology chronographs, and curated essentials.
        </p>
      </div>

      {/* Control Bar: Total Count + Sort Selector + Mobile Filter Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
            {products.length} {products.length === 1 ? 'Article' : 'Articles'}
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-950 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Trigger */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2 bg-neutral-950 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          {/* Sort Selector (Requirement 17) */}
          <div className="flex items-center gap-2">
            <label htmlFor="shop-sort" className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Sort By:
            </label>
            <select
              id="shop-sort"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-neutral-300 text-xs font-semibold uppercase tracking-wider text-neutral-900 py-2 px-3 focus:outline-none focus:border-neutral-950 cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="best-selling">Best Selling</option>
              <option value="rating">Best Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* DESKTOP FILTER SIDEBAR (Requirement 17) */}
        <aside className="hidden lg:block lg:col-span-1 space-y-8 pr-6 border-r border-neutral-200">
          {/* Search Query */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-3">
              Search Goods
            </h3>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Keywords or SKU..."
                className="w-full text-xs py-2 pl-8 pr-3 border border-neutral-300 focus:outline-none focus:border-neutral-950 uppercase tracking-wider"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Categories Filter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-3">
              Category
            </h3>
            <div className="space-y-1.5 text-xs tracking-wider">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setCurrentPage(1);
                }}
                className={`block w-full text-left py-1 transition-colors uppercase ${
                  !selectedCategory
                    ? 'font-bold text-neutral-950 underline underline-offset-4'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCurrentPage(1);
                  }}
                  className={`block w-full text-left py-1 transition-colors uppercase ${
                    selectedCategory === cat.id
                      ? 'font-bold text-neutral-950 underline underline-offset-4'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Filter (Requirement 17) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-3">
              Availability
            </h3>
            <div className="space-y-2 text-xs tracking-wider uppercase">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'in_stock', label: 'In Stock' },
                { id: 'out_of_stock', label: 'Out of Stock' },
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 cursor-pointer text-neutral-700">
                  <input
                    type="radio"
                    name="availability"
                    checked={availability === opt.id}
                    onChange={() => {
                      setAvailability(opt.id as any);
                      setCurrentPage(1);
                    }}
                    className="accent-neutral-950"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range (in PKR) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-3">
              Price Range (Rs.)
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-1/2 px-2 py-1.5 border border-neutral-300 text-xs uppercase"
              />
              <span className="text-neutral-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-1/2 px-2 py-1.5 border border-neutral-300 text-xs uppercase"
              />
            </div>
          </div>

          {/* Sizes (if available) */}
          {availableSizes.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-3">
                Size
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedSize('')}
                  className={`px-2.5 py-1 text-[11px] font-semibold border ${
                    !selectedSize
                      ? 'bg-neutral-950 border-neutral-950 text-white'
                      : 'border-neutral-300 text-neutral-700 hover:border-neutral-950'
                  }`}
                >
                  All
                </button>
                {availableSizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                    className={`px-2.5 py-1 text-[11px] font-semibold border ${
                      selectedSize === s
                        ? 'bg-neutral-950 border-neutral-950 text-white'
                        : 'border-neutral-300 text-neutral-700 hover:border-neutral-950'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors (if available) */}
          {availableColors.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-3">
                Color
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedColor('')}
                  className={`px-2.5 py-1 text-[11px] font-semibold border ${
                    !selectedColor
                      ? 'bg-neutral-950 border-neutral-950 text-white'
                      : 'border-neutral-300 text-neutral-700 hover:border-neutral-950'
                  }`}
                >
                  All
                </button>
                {availableColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(selectedColor === c ? '' : c)}
                    className={`px-2.5 py-1 text-[11px] font-semibold border ${
                      selectedColor === c
                        ? 'bg-neutral-950 border-neutral-950 text-white'
                        : 'border-neutral-300 text-neutral-700 hover:border-neutral-950'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* PRODUCT GRID STAGE (Requirements 8 & 24: 4 cols on wide desktop, 2 cols mobile) */}
        <main className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] bg-neutral-100 animate-pulse border border-neutral-200" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 border border-neutral-200 bg-neutral-50 px-6">
              <p className="text-sm font-serif font-bold uppercase tracking-wider text-neutral-950">
                No Products Found
              </p>
              <p className="text-xs text-neutral-500 mt-2 max-w-sm mx-auto leading-relaxed">
                We could not find any products matching your current search or filter combination.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="mt-6 px-6 py-2.5 bg-neutral-950 text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} navigate={navigate} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12 pt-6 border-t border-neutral-200">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-neutral-300 hover:border-neutral-950 disabled:opacity-30 disabled:hover:border-neutral-300"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono uppercase tracking-widest text-neutral-600 px-4">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-neutral-300 hover:border-neutral-950 disabled:opacity-30 disabled:hover:border-neutral-300"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE ANIMATED FILTER DRAWER / BOTTOM SHEET (Requirement 17) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          />

          <div className="relative w-full max-h-[85vh] bg-white shadow-2xl p-6 rounded-t-2xl z-10 overflow-y-auto animate-in slide-in-from-bottom duration-300 border-t border-neutral-200">
            <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
              <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-neutral-950">
                Filters & Refinements
              </h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-950"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Category */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-2">
                  Category
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-3 py-1.5 text-xs uppercase border ${
                      !selectedCategory
                        ? 'bg-neutral-950 border-neutral-950 text-white font-bold'
                        : 'border-neutral-300 text-neutral-700'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`px-3 py-1.5 text-xs uppercase border ${
                        selectedCategory === c.id
                          ? 'bg-neutral-950 border-neutral-950 text-white font-bold'
                          : 'border-neutral-300 text-neutral-700'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-2">
                  Availability
                </h4>
                <div className="flex gap-4 text-xs uppercase">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'in_stock', label: 'In Stock' },
                    { id: 'out_of_stock', label: 'Out of Stock' },
                  ].map((opt) => (
                    <label key={opt.id} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="mobile-avail"
                        checked={availability === opt.id}
                        onChange={() => setAvailability(opt.id as any)}
                        className="accent-neutral-950"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-2">
                  Price Range (Rs.)
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min Rs."
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2 px-3 py-2 border border-neutral-300 text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Max Rs."
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2 px-3 py-2 border border-neutral-300 text-xs"
                  />
                </div>
              </div>

              {/* Apply / Clear */}
              <div className="pt-4 border-t border-neutral-200 flex gap-3">
                <button
                  onClick={() => {
                    handleClearFilters();
                    setIsMobileFilterOpen(false);
                  }}
                  className="flex-1 py-3 border border-neutral-300 text-xs font-bold uppercase tracking-widest hover:border-neutral-900"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-3 bg-neutral-950 text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800"
                >
                  View ({products.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
