import React, { useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { formatPrice } from '../../utils/currency.ts';

interface CartDrawerProps {
  navigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ navigate }) => {
  const {
    isCartDrawerOpen,
    closeCartDrawer,
    items,
    itemCount,
    subtotal,
    freeShippingThreshold,
    updateQuantity,
    removeFromCart,
  } = useCart();

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  const freeShippingDifference = freeShippingThreshold - subtotal;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed Backdrop */}
      <div
        onClick={closeCartDrawer}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 ease-out border-l border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-neutral-950" />
            <h2 className="text-base font-serif font-bold tracking-wider uppercase text-neutral-950">
              Shopping Bag
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-full">
              {itemCount}
            </span>
          </div>
          <button
            onClick={closeCartDrawer}
            className="p-2 text-neutral-400 hover:text-neutral-950 transition-colors rounded-full hover:bg-neutral-100"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-100 text-xs text-neutral-700">
          {freeShippingDifference > 0 ? (
            <p className="mb-1.5 font-medium">
              Add <span className="font-bold text-neutral-950">{formatPrice(freeShippingDifference)}</span> more for free delivery
            </p>
          ) : (
            <p className="mb-1.5 font-semibold text-emerald-700">
              ✓ You have unlocked complimentary delivery!
            </p>
          )}
          <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                freeShippingDifference <= 0 ? 'bg-emerald-500' : 'bg-neutral-900'
              }`}
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-neutral-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 mb-4 border border-neutral-100">
                <ShoppingBag className="w-8 h-8 stroke-[1.25]" />
              </div>
              <h3 className="text-base font-serif font-bold tracking-wide uppercase text-neutral-950">
                Your Bag is Empty
              </h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs leading-relaxed">
                Discover something you&apos;ll love from our handcrafted seasonal collections.
              </p>
              <button
                onClick={() => {
                  closeCartDrawer();
                  navigate('/shop');
                }}
                className="mt-6 px-8 py-3 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold tracking-widest uppercase rounded-none transition-all active:scale-[0.98]"
              >
                Shop Now
              </button>
            </div>
          ) : (
            items.map((item) => {
              const primaryImg =
                item.product?.images?.find((img) => img.isPrimary)?.url ||
                item.product?.images?.[0]?.url ||
                '';
              const variant = item.product?.variants?.find((v) => v.id === item.variantId);
              const unitPrice = item.price || item.product?.salePrice || item.product?.regularPrice || 0;

              return (
                <div key={item.id} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <div
                    onClick={() => {
                      closeCartDrawer();
                      if (item.productId) navigate(`/product/${item.productId}`);
                    }}
                    className="w-20 h-24 bg-neutral-100 rounded-none overflow-hidden shrink-0 cursor-pointer border border-neutral-200"
                  >
                    {primaryImg ? (
                      <img
                        src={primaryImg}
                        alt={item.product?.name || 'Product'}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                        Baggio
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4
                          onClick={() => {
                            closeCartDrawer();
                            if (item.productId) navigate(`/product/${item.productId}`);
                          }}
                          className="text-xs font-semibold text-neutral-900 line-clamp-1 cursor-pointer hover:text-neutral-600 transition-colors uppercase tracking-wider"
                        >
                          {item.product?.name || 'Handcrafted Article'}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                          aria-label="Remove item from bag"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant / Size */}
                      {variant && (
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {variant.size && `Size: ${variant.size}`}
                          {variant.size && variant.color && ' · '}
                          {variant.color && `Color: ${variant.color}`}
                        </p>
                      )}

                      <p className="text-xs font-bold text-neutral-950 mt-1">
                        {formatPrice(unitPrice)}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="inline-flex items-center border border-neutral-300 rounded-none bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors disabled:opacity-40"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-semibold font-mono text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            const maxStock = item.product?.stockQuantity ?? 99;
                            if (item.quantity < maxStock) {
                              updateQuantity(item.id, item.quantity + 1);
                            }
                          }}
                          className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors disabled:opacity-40"
                          disabled={item.quantity >= (item.product?.stockQuantity ?? 99)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-neutral-900">
                        {formatPrice(unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Subtotal & Actions */}
        {items.length > 0 && (
          <div className="p-6 border-t border-neutral-100 bg-neutral-50 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                Subtotal
              </span>
              <span className="text-lg font-serif font-bold text-neutral-950">
                {formatPrice(subtotal)}
              </span>
            </div>

            <p className="text-[11px] text-neutral-500">
              Taxes and shipping calculated at checkout.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  closeCartDrawer();
                  navigate('/checkout');
                }}
                className="w-full py-3.5 px-6 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 active:scale-[0.99] shadow-sm"
              >
                <span>Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  closeCartDrawer();
                  navigate('/cart');
                }}
                className="w-full py-2.5 px-6 bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-semibold tracking-widest uppercase border border-neutral-300 transition-colors"
              >
                View Full Bag
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
