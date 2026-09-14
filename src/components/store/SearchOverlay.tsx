import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatPrice } from '../../utils/currency.ts';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  navigate,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Live search debounced
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(async () => {
      try {
        const data = await api.getProducts({ search: query.trim(), limit: 6 });
        setResults(data.products || []);
        setHasSearched(true);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [query]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Top Bar with Input */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-3">
            <Search className="w-6 h-6 text-neutral-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH BY PRODUCT NAME, BRAND, MATERIAL, SKU..."
              className="w-full text-base sm:text-xl font-serif tracking-wider uppercase text-neutral-950 placeholder-neutral-400 bg-transparent border-none outline-none focus:ring-0"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-neutral-400 hover:text-neutral-900 p-1 text-xs"
              >
                Clear
              </button>
            )}
          </form>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-950 rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Close search"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Live Results Stage */}
      <div className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-950 mb-2" />
            <span className="text-xs uppercase tracking-widest">Searching Atelier Archive...</span>
          </div>
        ) : query.trim() && hasSearched && results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm font-serif font-bold text-neutral-950 uppercase tracking-wider">
              No Products Found
            </p>
            <p className="text-xs text-neutral-500 mt-2 max-w-sm mx-auto leading-relaxed">
              We could not locate items matching &ldquo;{query}&rdquo;. Try browsing our full catalog or searching by leather, timepiece, or collection.
            </p>
            <button
              onClick={() => {
                onClose();
                navigate('/shop');
              }}
              className="mt-6 px-6 py-2.5 bg-neutral-950 text-white text-xs font-semibold uppercase tracking-widest rounded-none hover:bg-neutral-800 transition-colors"
            >
              Browse All Goods
            </button>
          </div>
        ) : results.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-neutral-100">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                Products ({results.length})
              </span>
              <button
                onClick={() => {
                  onClose();
                  navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
                }}
                className="text-xs font-semibold text-neutral-900 hover:text-neutral-600 flex items-center gap-1 uppercase tracking-wider"
              >
                <span>View all search results</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {results.map((product) => {
                const primaryImg =
                  product.images?.find((img) => img.isPrimary)?.url ||
                  product.images?.[0]?.url ||
                  '';
                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      onClose();
                      navigate(`/product/${product.id}`);
                    }}
                    className="group flex flex-col bg-white border border-neutral-200 overflow-hidden cursor-pointer hover:border-neutral-900 transition-all p-3"
                  >
                    <div className="aspect-[4/5] bg-neutral-100 overflow-hidden relative mb-3">
                      {primaryImg ? (
                        <img
                          src={primaryImg}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400 font-serif">
                          Baggio
                        </div>
                      )}
                      {product.stockQuantity === 0 && (
                        <div className="absolute top-2 left-2 bg-neutral-950 text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
                          Out of Stock
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-neutral-400 uppercase tracking-widest font-semibold">
                      {product.brand || 'Baggio'}
                    </div>

                    <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mt-0.5 line-clamp-1 group-hover:text-neutral-600 transition-colors">
                      {product.name}
                    </h4>

                    <div className="mt-2 flex items-baseline gap-2">
                      {product.salePrice && product.salePrice < product.regularPrice ? (
                        <>
                          <span className="text-xs font-bold text-neutral-950">
                            {formatPrice(product.salePrice)}
                          </span>
                          <span className="text-[11px] text-neutral-400 line-through">
                            {formatPrice(product.regularPrice)}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-neutral-950">
                          {formatPrice(product.regularPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-neutral-400">
            <p className="text-xs uppercase tracking-widest">
              Type keywords above to discover handcrafted leather goods, chronographs, and accessories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
