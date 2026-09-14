import React from 'react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { formatPrice } from '../../utils/currency.ts';

interface WishlistPageProps {
  navigate: (path: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ navigate }) => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-neutral-950">Your Wishlist is Empty</h2>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          Save articles you admire while browsing to keep track of their availability and seasonal releases.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="mt-4 px-6 py-3 bg-neutral-950 text-white text-xs font-semibold rounded-full hover:bg-neutral-800 transition-colors"
        >
          Discover Atelier Articles
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 pb-4 border-b border-neutral-100">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Curated Favorites
        </span>
        <h1 className="text-3xl font-serif font-bold text-neutral-950 mt-1">
          Saved Wishlist ({wishlist.length})
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => {
          const img = product.images.find((i) => i.isPrimary)?.url || product.images[0]?.url || '';
          const price = product.salePrice ?? product.regularPrice;

          return (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-neutral-200/80 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div
                onClick={() => navigate(`/product/${product.id}`)}
                className="aspect-[4/5] bg-neutral-100 relative cursor-pointer overflow-hidden group"
              >
                <img
                  src={img}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWishlist(product.id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-rose-50 text-neutral-500 hover:text-rose-600 rounded-full shadow-sm transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <p className="text-[11px] font-semibold text-neutral-400 uppercase">
                    {product.brand}
                  </p>
                  <h3
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="text-xs font-bold text-neutral-900 truncate hover:text-black cursor-pointer"
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs font-bold text-neutral-950 mt-1">{formatPrice(price)}</p>
                </div>

                <button
                  onClick={() => addToCart(product, 1)}
                  disabled={product.stockQuantity === 0}
                  className="w-full py-2 px-3 bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-200 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{product.stockQuantity === 0 ? 'Sold Out' : 'Move to Bag'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
