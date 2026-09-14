import React, { useState } from 'react';
import { X, ShoppingBag, Heart, ArrowRight, Minus, Plus, ShieldCheck, Check } from 'lucide-react';
import { Product, ProductVariant } from '../../types/index.ts';
import { formatPrice, getDiscountPercentage } from '../../utils/currency.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  navigate,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen || !product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [];
  const currentImageUrl = images[selectedImageIndex]?.url || images[0]?.url || '';
  const isFavorited = isInWishlist(product.id);

  const availableVariants = product.variants || [];
  const sizes = Array.from(new Set(availableVariants.map((v) => v.size).filter(Boolean))) as string[];
  const colors = Array.from(new Set(availableVariants.map((v) => v.color).filter(Boolean))) as string[];

  const selectedVariant = availableVariants.find((v) => v.id === selectedVariantId);
  const unitPrice = selectedVariant?.price || product.salePrice || product.regularPrice;
  const hasDiscount = product.salePrice && product.salePrice < product.regularPrice;
  const discountPercent = getDiscountPercentage(product.regularPrice, product.salePrice);

  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    try {
      const targetVariantId = selectedVariantId || (availableVariants[0]?.id);
      await addToCart(product, quantity, targetVariantId);
      onClose();
    } finally {
      setIsAdding(false);
    }
  };

  const handleFullDetails = () => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-white shadow-2xl rounded-none z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-neutral-200 my-auto max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-neutral-400 hover:text-neutral-950 transition-colors bg-white/80 hover:bg-white rounded-full backdrop-blur-md"
          aria-label="Close quick view"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Gallery */}
        <div className="w-full md:w-1/2 bg-neutral-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-100">
          <div className="relative aspect-[4/5] w-full bg-white overflow-hidden border border-neutral-200">
            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm font-serif">
                Baggio Fine Goods
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {isOutOfStock && (
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-neutral-950 text-white">
                  Out of Stock
                </span>
              )}
              {isLowStock && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white">
                  Low Stock ({product.stockQuantity} remaining)
                </span>
              )}
              {hasDiscount && !isOutOfStock && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white">
                  -{discountPercent}%
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-14 h-16 shrink-0 border overflow-hidden transition-all ${
                    idx === selectedImageIndex
                      ? 'border-neutral-950 ring-1 ring-neutral-950'
                      : 'border-neutral-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Brand & Category */}
            <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold tracking-widest uppercase mb-1">
              <span>{product.brand || 'Baggio'}</span>
              <span className="text-[11px] font-mono text-neutral-400">SKU: {product.sku}</span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-serif font-bold text-neutral-950 uppercase tracking-wide">
              {product.name}
            </h2>

            {/* Pricing in PKR */}
            <div className="flex items-baseline gap-3 mt-3 pb-3 border-b border-neutral-100">
              {hasDiscount ? (
                <>
                  <span className="text-xl font-bold text-neutral-950">
                    {formatPrice(product.salePrice)}
                  </span>
                  <span className="text-sm text-neutral-400 line-through">
                    {formatPrice(product.regularPrice)}
                  </span>
                  <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5">
                    {discountPercent}% OFF
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-neutral-950">
                  {formatPrice(product.regularPrice)}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-xs text-neutral-600 mt-4 leading-relaxed line-clamp-3">
              {product.shortDescription || product.description}
            </p>

            {/* Sizes Selection (if existing) */}
            {sizes.length > 0 && (
              <div className="mt-5">
                <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-2">
                  <span>Size</span>
                  <span className="text-[11px] text-neutral-400">Italian Standard</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableVariants
                    .filter((v) => v.size)
                    .map((variant) => {
                      const isSelected = variant.id === selectedVariantId;
                      const isVariantOos = variant.stockQuantity <= 0;
                      return (
                        <button
                          key={variant.id}
                          disabled={isVariantOos}
                          onClick={() => setSelectedVariantId(variant.id)}
                          className={`min-w-[40px] px-3 py-2 text-xs font-semibold tracking-wider border transition-all ${
                            isVariantOos
                              ? 'bg-neutral-100 border-neutral-200 text-neutral-400 line-through cursor-not-allowed'
                              : isSelected
                              ? 'bg-neutral-950 border-neutral-950 text-white'
                              : 'bg-white border-neutral-300 text-neutral-800 hover:border-neutral-950'
                          }`}
                        >
                          {variant.size}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Colors list if existing */}
            {colors.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-2">
                  Available Finishes
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <span
                      key={color}
                      className="px-2.5 py-1 text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Inventory Status */}
            <div className="mt-5 flex items-center gap-2 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              <span className="font-semibold uppercase tracking-wider text-neutral-800">
                {isOutOfStock
                  ? 'Out of Stock'
                  : isLowStock
                  ? `Low Stock — Only ${product.stockQuantity} remaining`
                  : 'In Stock & Ready to Dispatch'}
              </span>
            </div>
          </div>

          {/* Purchase Actions */}
          <div className="mt-6 pt-4 border-t border-neutral-100 space-y-3">
            <div className="flex gap-3">
              {/* Quantity selector */}
              {!isOutOfStock && (
                <div className="inline-flex items-center border border-neutral-300 bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2.5 text-neutral-600 hover:text-black disabled:opacity-30"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-semibold font-mono text-neutral-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => {
                      if (quantity < product.stockQuantity) {
                        setQuantity(quantity + 1);
                      }
                    }}
                    disabled={quantity >= product.stockQuantity}
                    className="p-2.5 text-neutral-600 hover:text-black disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className="flex-1 py-3.5 px-6 bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Out of Stock' : isAdding ? 'Adding...' : 'Add to Bag'}</span>
              </button>

              {/* Wishlist toggle button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 border transition-colors ${
                  isFavorited
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-neutral-300 text-neutral-600 hover:border-neutral-950 hover:text-neutral-950'
                }`}
                title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
                aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600' : ''}`} />
              </button>
            </div>

            {/* View Full Product Link */}
            <button
              onClick={handleFullDetails}
              className="w-full py-2 text-center text-xs font-semibold text-neutral-500 hover:text-neutral-950 flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider"
            >
              <span>View Full Product Specifications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
