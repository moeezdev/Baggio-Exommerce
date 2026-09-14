import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { Product, ProductVariant } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { formatPrice, getDiscountPercentage } from '../../utils/currency.ts';
import { SizeSelectionModal } from './SizeSelectionModal.tsx';
import { QuickViewModal } from './QuickViewModal.tsx';

interface ProductCardProps {
  product: Product;
  navigate: (path: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, navigate }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    '';
  const secondaryImage =
    product.images && product.images.length > 1
      ? product.images[1]?.url
      : primaryImage;

  const hasDiscount = product.salePrice && product.salePrice < product.regularPrice;
  const discountPercent = getDiscountPercentage(product.regularPrice, product.salePrice);

  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock =
    product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold;

  // Check if this product has real sizes
  const hasSizes = Boolean(
    product.variants &&
      product.variants.some((v) => v.size && v.size.trim().length > 0)
  );

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHeartAnimating(true);
    toggleWishlist(product);
    setTimeout(() => setIsHeartAnimating(false), 300);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    if (hasSizes) {
      setIsSizeModalOpen(true);
    } else {
      addToCart(product, 1);
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleSizeConfirm = (variant: ProductVariant) => {
    addToCart(product, 1, variant.id);
  };

  return (
    <>
      <div
        id={`product-card-${product.id}`}
        onClick={() => navigate(`/product/${product.id}`)}
        className="group relative flex flex-col bg-white border border-neutral-200/90 overflow-hidden hover:border-neutral-950 transition-all duration-300 cursor-pointer select-none"
      >
        {/* Image Stage */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-serif text-neutral-400">
              BAGGIO
            </div>
          )}

          {/* Secondary image hover fade (Requirement 9) */}
          {secondaryImage && secondaryImage !== primaryImage && (
            <img
              src={secondaryImage}
              alt={`${product.name} alternate view`}
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
            />
          )}

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {isOutOfStock ? (
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-neutral-950 text-white">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-amber-500 text-white">
                Low Stock
              </span>
            ) : null}

            {hasDiscount && !isOutOfStock && (
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-rose-600 text-white">
                -{discountPercent}%
              </span>
            )}

            {product.isNew && !isOutOfStock && (
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-neutral-900 text-white">
                New
              </span>
            )}
          </div>

          {/* Wishlist Button (Requirement 26) */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2.5 right-2.5 p-2 transition-all z-10 rounded-full ${
              isFavorited
                ? 'bg-white text-rose-600 shadow-sm'
                : 'bg-white/80 text-neutral-600 hover:text-black hover:bg-white backdrop-blur-sm'
            }`}
            title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isHeartAnimating ? 'scale-125' : 'scale-100'
              } ${isFavorited ? 'fill-rose-600' : ''}`}
            />
          </button>

          {/* Quick View Button */}
          <button
            onClick={handleQuickViewClick}
            className="hidden sm:flex absolute bottom-12 right-2.5 p-2 bg-white/90 hover:bg-white text-neutral-800 hover:text-neutral-950 transition-all z-10 opacity-0 group-hover:opacity-100 shadow-sm backdrop-blur-sm"
            title="Quick View"
            aria-label="Quick View"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Desktop Hover / Mobile Action: Subtle ADD TO BAG Bar (Requirements 10, 11, 12) */}
          {!isOutOfStock ? (
            <div className="absolute inset-x-0 bottom-0 p-2.5 translate-y-2 sm:translate-y-full opacity-100 sm:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 z-10 bg-gradient-to-t from-black/40 via-black/10 to-transparent sm:bg-none">
              <button
                onClick={handleAddClick}
                className="w-full py-2.5 px-3 bg-neutral-950 hover:bg-neutral-800 text-white text-[11px] font-bold uppercase tracking-widest shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-3 h-3" />
                <span>{hasSizes ? 'Select Size' : 'Add to Bag'}</span>
              </button>
            </div>
          ) : (
            <div className="absolute inset-x-0 bottom-0 p-2.5 z-10">
              <button
                disabled
                className="w-full py-2 px-3 bg-neutral-200/90 text-neutral-500 text-[10px] font-bold uppercase tracking-widest cursor-not-allowed text-center"
              >
                Sold Out
              </button>
            </div>
          )}
        </div>

        {/* Product Details Info */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">
              <span>{product.brand || 'Baggio'}</span>
              {product.rating > 0 && (
                <div className="flex items-center gap-1 text-neutral-700">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-[11px]">{product.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 uppercase tracking-wider group-hover:text-black transition-colors line-clamp-1">
              {product.name}
            </h3>

            {product.shortDescription && (
              <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1">
                {product.shortDescription}
              </p>
            )}
          </div>

          {/* Pricing in Pakistani Rupees (PKR) with Sale format (Requirements 13 & 14) */}
          <div className="mt-3 pt-2 border-t border-neutral-100 flex items-baseline gap-2">
            {hasDiscount ? (
              <>
                <span className="text-xs sm:text-sm font-bold text-neutral-950">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-[11px] text-neutral-400 line-through">
                  {formatPrice(product.regularPrice)}
                </span>
              </>
            ) : (
              <span className="text-xs sm:text-sm font-bold text-neutral-950">
                {formatPrice(product.regularPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Size Selection Popover / Bottom Sheet */}
      {hasSizes && (
        <SizeSelectionModal
          product={product}
          isOpen={isSizeModalOpen}
          onClose={() => setIsSizeModalOpen(false)}
          onConfirm={handleSizeConfirm}
        />
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        navigate={navigate}
      />
    </>
  );
};
