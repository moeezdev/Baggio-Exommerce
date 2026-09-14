import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Check,
  AlertTriangle,
  MapPin,
  CreditCard,
  XCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { formatPrice } from '../../utils/currency.ts';

interface OrderDetailsPageProps {
  orderId: string;
  navigate: (path: string) => void;
}

const ORDER_STEPS: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

export const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ orderId, navigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getOrderById(orderId)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you wish to cancel this commission?')) return;
    setIsCancelling(true);
    try {
      const res = await api.cancelOrder(orderId);
      setOrder(res.order);
      success('Order cancelled successfully.');
    } catch (err: any) {
      error(err.message || 'Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-4">
        <div className="h-8 bg-neutral-100 rounded w-1/3"></div>
        <div className="h-48 bg-neutral-100 rounded-2xl"></div>
        <div className="h-64 bg-neutral-100 rounded-2xl"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-neutral-900">Order Record Not Found</h2>
        <button
          onClick={() => navigate('/account/orders')}
          className="mt-4 px-5 py-2 bg-neutral-950 text-white text-xs font-semibold rounded-lg"
        >
          Return to Orders
        </button>
      </div>
    );
  }

  const currentStepIndex = ORDER_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'Cancelled';
  const canCancel = order.orderStatus === 'Pending' || order.orderStatus === 'Confirmed';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
        <div>
          <button
            onClick={() => navigate('/account/orders')}
            className="text-xs font-semibold text-neutral-500 hover:text-black flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Orders</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-950">
            Dossier {order.orderNumber}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Registered on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {canCancel && (
          <button
            onClick={handleCancelOrder}
            disabled={isCancelling}
            className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {isCancelling ? 'Processing...' : 'Request Order Cancellation'}
          </button>
        )}
      </div>

      {/* Live Tracking Progress Pipeline */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
            Fulfillment Stage
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isCancelled
                ? 'bg-rose-100 text-rose-800'
                : order.orderStatus === 'Delivered'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-900'
            }`}
          >
            {order.orderStatus}
          </span>
        </div>

        {isCancelled ? (
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 flex items-center gap-3 text-rose-800 text-xs">
            <XCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">Commission Cancelled</p>
              <p className="text-rose-700 mt-0.5">
                This order has been officially cancelled. No charges or shipments will take place.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative py-4">
            {/* Step line bar */}
            <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-neutral-100 -translate-y-1/2 z-0">
              <div
                className="h-full bg-neutral-950 transition-all duration-500"
                style={{
                  width: `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 100}%`,
                }}
              ></div>
            </div>

            {/* Steps points */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10">
              {ORDER_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step} className="flex sm:flex-col items-center gap-3 sm:gap-2 sm:text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                        isPassed
                          ? 'bg-neutral-950 text-white shadow-sm'
                          : 'bg-neutral-100 text-neutral-400'
                      } ${isCurrent ? 'ring-4 ring-neutral-200' : ''}`}
                    >
                      {isPassed ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          isPassed ? 'text-neutral-900' : 'text-neutral-400'
                        }`}
                      >
                        {step}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recipient & Payment Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Courier Handover Location</span>
          </div>
          <p className="text-xs font-semibold text-neutral-900">{order.shippingAddress.fullName}</p>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {order.shippingAddress.address}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
            {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
          </p>
          <p className="text-xs text-neutral-500 pt-1">Tel: {order.shippingAddress.phone}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs uppercase tracking-wider">
            <CreditCard className="w-4 h-4" />
            <span>Settlement Particulars</span>
          </div>
          <p className="text-xs font-semibold text-neutral-900">{order.paymentMethod}</p>
          <p className="text-xs text-neutral-500">
            Payment Status: <strong className="capitalize text-neutral-800">{order.paymentStatus}</strong>
          </p>
          {order.notes && (
            <div className="mt-3 pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
              <span className="font-semibold text-neutral-700">Client Note: </span>
              {order.notes}
            </div>
          )}
        </div>
      </div>

      {/* Purchased Articles Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
          Commissioned Articles ({order.items.length})
        </h2>

        <div className="divide-y divide-neutral-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {item.productImage && (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    referrerPolicy="no-referrer"
                    className="w-14 h-16 object-cover rounded-lg bg-neutral-100 shrink-0"
                  />
                )}
                <div>
                  <h3 className="text-xs font-bold text-neutral-900">{item.productName}</h3>
                  {item.variantName && (
                    <p className="text-[11px] text-neutral-500">Variant: {item.variantName}</p>
                  )}
                  <p className="text-xs text-neutral-400">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-neutral-950">
                {formatPrice(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-neutral-200 space-y-2 text-xs max-w-xs ml-auto">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span className="font-semibold text-neutral-900">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Discount ({order.couponCode || 'Promo'})</span>
              <span className="font-semibold">-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-neutral-600">
            <span>Insured Courier</span>
            <span className="font-semibold text-neutral-900">
              {order.shippingFee === 0 ? 'Complimentary' : formatPrice(order.shippingFee)}
            </span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Tax</span>
            <span className="font-semibold text-neutral-900">{formatPrice(order.tax)}</span>
          </div>
          <div className="pt-2 border-t border-neutral-200 flex justify-between text-sm font-bold text-neutral-950">
            <span>Total</span>
            <span className="text-base">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
