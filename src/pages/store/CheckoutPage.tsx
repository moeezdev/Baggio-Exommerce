import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { api } from '../../services/api.ts';
import { formatPrice } from '../../utils/currency.ts';

interface CheckoutPageProps {
  navigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
  const { items, subtotal, shippingFee, discount, tax, total, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const { error, success } = useToast();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+92 300 1234567',
    address: 'Gulberg III, Main Boulevard',
    city: 'Lahore',
    state: 'Punjab',
    postalCode: '54000',
    country: 'Pakistan',
    paymentMethod: 'Cash on Delivery (COD)',
    notes: '',
  });

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.address || !formData.city || !formData.postalCode) {
      error('Please complete all required shipping fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          price: i.price || i.product?.salePrice || i.product?.regularPrice || 0,
        })),
        couponCode: appliedCoupon?.code,
        notes: formData.notes,
      };

      const res = await api.createOrder(orderPayload);
      await clearCart();
      success('Your order has been officially registered!');
      navigate(`/order-confirmation/${res.order.id}`);
    } catch (err: any) {
      error(err.message || 'Failed to complete order checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <button
        onClick={() => navigate('/cart')}
        className="text-xs font-semibold text-neutral-600 hover:text-black flex items-center gap-1 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Shopping Bag</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        {/* Left Column: Forms (7 cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmitOrder} className="space-y-8">
            {/* Customer & Shipping Section */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-base font-serif font-bold text-neutral-950">
                  1. Recipient & Courier Destination
                </h2>
                <span className="text-xs text-neutral-400">Insured Delivery</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-900"
                    placeholder="e.g. Leonardo Vance"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-900"
                    placeholder="you@domain.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-900"
                    placeholder="+1 555-0199"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Street Address & Suite *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-900"
                    placeholder="Street name, apartment, flat, or floor"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-900"
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Italy">Italy</option>
                    <option value="France">France</option>
                    <option value="Germany">Germany</option>
                    <option value="Canada">Canada</option>
                    <option value="Japan">Japan</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Special Delivery Instructions
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-900"
                    placeholder="Gate code, concierge handover instructions..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-base font-serif font-bold text-neutral-950">
                  2. Settlement & Payment Authorization
                </h2>
                <div className="flex items-center gap-1 text-emerald-700 text-xs font-medium">
                  <Lock className="w-3.5 h-3.5" />
                  <span>256-bit Secured</span>
                </div>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery option */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.paymentMethod === 'Cash on Delivery (COD)'
                      ? 'border-neutral-950 bg-neutral-50/80'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery (COD)"
                    checked={formData.paymentMethod === 'Cash on Delivery (COD)'}
                    onChange={handleChange}
                    className="mt-1 text-neutral-950 focus:ring-neutral-950"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-950">
                        Cash on Delivery (Handover Verification)
                      </span>
                      <Truck className="w-4 h-4 text-neutral-500" />
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Pay upon physical arrival and inspection of your parcel by private courier.
                    </p>
                  </div>
                </label>

                {/* Credit Card option */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.paymentMethod === 'Credit Card (Stripe)'
                      ? 'border-neutral-950 bg-neutral-50/80'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Credit Card (Stripe)"
                    checked={formData.paymentMethod === 'Credit Card (Stripe)'}
                    onChange={handleChange}
                    className="mt-1 text-neutral-950 focus:ring-neutral-950"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-950">
                        Card Payment (Online Checkout)
                      </span>
                      <CreditCard className="w-4 h-4 text-neutral-500" />
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Direct authorization via Visa, Mastercard, or American Express.
                    </p>

                    {formData.paymentMethod === 'Credit Card (Stripe)' && (
                      <div className="mt-3 pt-3 border-t border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="Card number"
                            className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded text-xs"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded text-xs"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="CVC"
                            className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Place Order Action */}
            <button
              id="checkout-submit-order-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Registering Commission...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Authorize & Place Order ({formatPrice(total)})</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Review (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-serif font-bold text-neutral-950 pb-3 border-b border-neutral-200">
              Articles in Order ({items.length})
            </h2>

            {/* Item Mini List */}
            <div className="divide-y divide-neutral-200 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => {
                const product = item.product;
                const unitPrice = item.price || product?.salePrice || product?.regularPrice || 0;
                const img = product?.images?.find((i) => i.isPrimary)?.url || product?.images?.[0]?.url || '';

                return (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <div className="w-12 h-14 bg-neutral-100 rounded-lg overflow-hidden shrink-0">
                      {img && (
                        <img
                          src={img}
                          alt={product?.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-900 truncate">
                        {product?.name}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        Qty: {item.quantity} × {formatPrice(unitPrice)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-neutral-950">
                      {formatPrice(unitPrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-neutral-200 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Coupon Deduction ({appliedCoupon?.code})</span>
                  <span className="font-semibold">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Insured Courier Delivery</span>
                <span className="font-semibold text-neutral-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600">Complimentary</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Tax Assessment (8.5%)</span>
                <span className="font-semibold text-neutral-900">{formatPrice(tax)}</span>
              </div>
              <div className="pt-3 border-t border-neutral-200 flex justify-between text-sm font-bold text-neutral-950">
                <span>Total Payable</span>
                <span className="text-xl">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
