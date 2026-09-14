import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Tag,
  Check,
  X,
  Truck,
} from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { formatPrice } from '../../utils/currency.ts';

interface CartPageProps {
  navigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ navigate }) => {
  const {
    items,
    itemCount,
    subtotal,
    shippingFee,
    discount,
    tax,
    total,
    appliedCoupon,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const freeShippingThreshold = 150;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    const success = await applyCoupon(couponInput.trim());
    if (success) {
      setCouponInput('');
    }
    setIsApplyingCoupon(false);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-neutral-900">Your Bag is Empty</h2>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          Explore our leather luggage, horological pieces, and handcrafted footwear to add to your order.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="mt-4 px-8 py-3.5 bg-neutral-950 text-white text-xs font-semibold rounded-full hover:bg-neutral-800 transition-colors"
        >
          Explore the Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 pb-4 border-b border-neutral-100">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Your Selection
        </span>
        <h1 className="text-3xl font-serif font-bold text-neutral-950 mt-1">
          Shopping Bag ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Items List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Free Shipping Progress Indicator */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                <Truck className="w-4 h-4 text-emerald-600" />
                {remainingForFreeShipping > 0 ? (
                  <span>
                    Add <strong className="text-neutral-950">{formatPrice(remainingForFreeShipping)}</strong> more for complimentary express delivery
                  </span>
                ) : (
                  <span className="text-emerald-700">You have unlocked complimentary express delivery!</span>
                )}
              </div>
              <span className="text-[11px] font-bold text-neutral-500">{freeShippingPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-neutral-950 transition-all duration-300"
                style={{ width: `${freeShippingPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Items */}
          <div className="divide-y divide-neutral-100 bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm">
            {items.map((item) => {
              const product = item.product;
              const unitPrice = item.price || product?.salePrice || product?.regularPrice || 0;
              const imgUrl = product?.images?.find((i) => i.isPrimary)?.url || product?.images?.[0]?.url || '';

              return (
                <div key={item.id} className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-center">
                  {/* Thumbnail */}
                  <div
                    onClick={() => product && navigate(`/product/${product.id}`)}
                    className="w-20 h-24 sm:w-24 sm:h-28 bg-neutral-100 rounded-xl overflow-hidden shrink-0 cursor-pointer"
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={product?.name || 'Product'}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3
                          onClick={() => product && navigate(`/product/${product.id}`)}
                          className="text-sm font-semibold text-neutral-900 hover:text-black transition-colors cursor-pointer truncate"
                        >
                          {product?.name || 'Baggio Fine Article'}
                        </h3>
                        {item.variantId && product?.variants && (
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Edition: {product.variants.find((v) => v.id === item.variantId)?.name || 'Custom'}
                          </p>
                        )}
                        <p className="text-xs text-neutral-400 mt-0.5">SKU: {product?.sku || 'BAG-00'}</p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-400 hover:text-rose-600 p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price and Quantity Controls */}
                    <div className="mt-4 flex items-center justify-between">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-neutral-500 hover:text-black"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-neutral-500 hover:text-black"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right">
                        <span className="text-sm font-bold text-neutral-950">
                          {formatPrice(unitPrice * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <p className="text-[11px] text-neutral-400">
                            {formatPrice(unitPrice)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate('/shop')}
            className="text-xs font-semibold text-neutral-700 hover:text-black inline-flex items-center gap-1.5 pt-2"
          >
            <span>← Continue Shopping</span>
          </button>
        </div>

        {/* Order Summary Box (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4 shadow-sm">
            <h2 className="text-base font-serif font-bold text-neutral-950 pb-3 border-b border-neutral-200">
              Order Summary
            </h2>

            {/* Price lines */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Coupon Discount ({appliedCoupon?.code})
                  </span>
                  <span className="font-semibold">-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-neutral-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600">Complimentary</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-neutral-600">
                <span>Calculated Tax (8.5%)</span>
                <span className="font-semibold text-neutral-900">{formatPrice(tax)}</span>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-between text-sm font-bold text-neutral-950">
                <span>Total Due</span>
                <span className="text-lg">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Coupon Code Entry */}
            <div className="pt-2">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-emerald-700 hover:text-emerald-900 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon code (e.g. WELCOME10)"
                    className="flex-1 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs uppercase font-medium focus:outline-none focus:border-neutral-900"
                  />
                  <button
                    type="submit"
                    disabled={isApplyingCoupon}
                    className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Proceed to Checkout Button */}
            <button
              id="proceed-to-checkout-btn"
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-6 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <span className="text-[11px] text-neutral-400">
                Encrypted checkout with bank-grade SSL security.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
