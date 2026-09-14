import React, { useState } from 'react';
import { X, ShoppingBag, Check } from 'lucide-react';
import { Product, ProductVariant } from '../../types/index.ts';
import { formatPrice } from '../../utils/currency.ts';

interface SizeSelectionModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (variant: ProductVariant) => void;
}

export const SizeSelectionModal: React.FC<SizeSelectionModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
}) => {
  // Only extract unique sizes that actually exist in product.variants
  const availableVariants = product.variants?.filter((v) => v.size && v.size.trim().length > 0) || [];

  const [selectedVariantId, setSelectedVariantId] = useState<string>(() => {
    const firstInStock = availableVariants.find((v) => v.stockQuantity > 0);
    return firstInStock ? firstInStock.id : (availableVariants[0]?.id || '');
  });

  if (!isOpen) return null;

  const selectedVariant = availableVariants.find((v) => v.id === selectedVariantId);
  const primaryImage = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || '';
  const effectivePrice = selectedVariant?.price || product.salePrice || product.regularPrice;

  const handleAddToCart = () => {
    if (selectedVariant) {
      onConfirm(selectedVariant);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Responsive Sheet (Bottom sheet on mobile, clean modal on desktop) */}
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-none shadow-2xl p-6 z-10 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 border-t sm:border border-neutral-200">
        {/* Mobile Pull Bar */}
        <div className="sm:hidden w-12 h-1 bg-neutral-300 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400">
              Quick Selection
            </span>
            <h3 className="text-sm font-serif font-bold text-neutral-950 uppercase tracking-wider line-clamp-1">
              {product.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-950 transition-colors rounded-full hover:bg-neutral-100"
            aria-label="Close size selector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product preview line */}
        <div className="flex items-center gap-3 py-3 border-b border-neutral-100">
          {primaryImage && (
            <img
              src={primaryImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-12 h-14 object-cover border border-neutral-200"
            />
          )}
          <div>
            <div className="text-xs font-semibold text-neutral-900">{formatPrice(effectivePrice)}</div>
            <div className="text-[11px] text-neutral-500">
              {selectedVariant
                ? selectedVariant.stockQuantity > 0
                  ? `Selected size: ${selectedVariant.size}`
                  : `${selectedVariant.size} (Out of Stock)`
                : 'Select your size'}
            </div>
          </div>
        </div>

        {/* Size Selector */}
        <div className="py-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Select Size
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {availableVariants.map((variant) => {
              const isSelected = variant.id === selectedVariantId;
              const isOutOfStock = variant.stockQuantity <= 0;

              return (
                <button
                  key={variant.id}
                  disabled={isOutOfStock}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`py-2.5 px-2 text-xs font-semibold tracking-wider transition-all border flex flex-col items-center justify-center relative ${
                    isOutOfStock
                      ? 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed line-through'
                      : isSelected
                      ? 'bg-neutral-950 border-neutral-950 text-white'
                      : 'bg-white border-neutral-300 text-neutral-800 hover:border-neutral-950'
                  }`}
                >
                  <span>{variant.size}</span>
                  {isSelected && (
                    <Check className="w-3 h-3 absolute top-1 right-1 text-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stockQuantity <= 0}
            className="w-full py-3 px-4 bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
