import React, { useState, useEffect } from 'react';
import { CheckCircle2, Package, ArrowRight, Truck, Clock, ShieldCheck } from 'lucide-react';
import { Order } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatPrice } from '../../utils/currency.ts';

interface OrderConfirmationPageProps {
  orderId: string;
  navigate: (path: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ orderId, navigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getOrderById(orderId)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="w-16 h-16 bg-neutral-100 rounded-full mx-auto mb-4"></div>
        <div className="h-6 bg-neutral-100 rounded w-1/2 mx-auto mb-2"></div>
        <div className="h-4 bg-neutral-100 rounded w-1/3 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-8">
      {/* Success Badge & Headline */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Order Registered
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-950">
          Thank you for your patronage.
        </h1>
        <p className="text-sm text-neutral-600 max-w-md mx-auto">
          Your commission <span className="font-bold text-neutral-900">{order?.orderNumber || orderId}</span> has been received and scheduled for preparation at our Florence atelier.
        </p>
      </div>

      {/* Order Info Card */}
      {order && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-100 text-xs">
            <div>
              <p className="text-neutral-400">Order Reference</p>
              <p className="font-bold text-neutral-950 text-sm mt-0.5">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-neutral-400">Status</p>
              <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-amber-100 text-amber-900">
                {order.orderStatus}
              </span>
            </div>
            <div>
              <p className="text-neutral-400">Payment</p>
              <p className="font-semibold text-neutral-900 mt-0.5">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-neutral-400">Total Charged</p>
              <p className="font-bold text-neutral-950 text-sm mt-0.5">{formatPrice(order.total)}</p>
            </div>
          </div>

          {/* Delivery destination preview */}
          <div className="text-xs space-y-1">
            <p className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">Courier Destination</p>
            <p className="text-neutral-700">{order.shippingAddress.fullName}</p>
            <p className="text-neutral-500">
              {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-3 pt-2">
            <p className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">Articles Commissioned</p>
            <div className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-12 object-cover rounded bg-neutral-100 shrink-0"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-neutral-900">{item.productName}</p>
                      <p className="text-neutral-400 text-[11px]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-950">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {order && (
          <button
            onClick={() => navigate(`/account/orders/${order.id}`)}
            className="w-full sm:w-auto px-6 py-3 bg-neutral-950 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
          >
            <span>Track Order Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => navigate('/shop')}
          className="w-full sm:w-auto px-6 py-3 bg-neutral-100 text-neutral-800 text-xs font-semibold rounded-xl hover:bg-neutral-200 transition-colors"
        >
          Continue Browsing Catalog
        </button>
      </div>
    </div>
  );
};
