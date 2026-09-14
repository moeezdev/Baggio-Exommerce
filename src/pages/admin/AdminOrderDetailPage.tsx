import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  Truck,
  User,
  Package,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminOrderDetailPageProps {
  orderId: string;
  navigate: (path: string) => void;
}

export const AdminOrderDetailPage: React.FC<AdminOrderDetailPageProps> = ({ orderId, navigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('Pending');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed' | 'refunded'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    api.getOrderById(orderId)
      .then((ord) => {
        setOrder(ord);
        setOrderStatus(ord.orderStatus);
        setPaymentStatus(ord.paymentStatus);
      })
      .catch((err) => {
        console.error(err);
        error('Could not load order details');
      })
      .finally(() => setIsLoading(false));
  }, [orderId]);

  const handleUpdateStatus = async () => {
    setIsSaving(true);
    try {
      const res = await api.adminUpdateOrderStatus(orderId, orderStatus);
      setOrder(res.order);
      success('Order status updated successfully');
    } catch (err: any) {
      error(err.message || 'Failed to update order');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !order) {
    return <div className="p-12 text-center text-xs text-neutral-400">Loading order dossier...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Orders</span>
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Order {order.orderNumber}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-800 text-neutral-300">
              {order.orderStatus}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Registered on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 text-xs text-white rounded-xl focus:outline-none focus:border-amber-400"
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            onClick={handleUpdateStatus}
            disabled={isSaving}
            className="px-4 py-2 bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Updating...' : 'Update Status'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Articles List (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Commissioned Articles ({order.items.length})
            </h3>

            <div className="divide-y divide-neutral-900">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        referrerPolicy="no-referrer"
                        className="w-14 h-16 object-cover rounded-lg bg-neutral-900 border border-neutral-800 shrink-0"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-white text-xs">{item.productName}</p>
                      {item.variantName && (
                        <p className="text-[11px] text-neutral-400">Variant: {item.variantName}</p>
                      )}
                      <p className="text-xs text-neutral-500">
                        ${item.price.toFixed(2)} × {item.quantity} units
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-white text-sm">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-4 border-t border-neutral-800 space-y-2 text-xs max-w-xs ml-auto">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span className="font-semibold text-white">${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Discount ({order.couponCode})</span>
                  <span className="font-semibold">-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-400">
                <span>Shipping Fee</span>
                <span className="font-semibold text-white">
                  {order.shippingFee === 0 ? 'Free' : `$${order.shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Tax Assessment</span>
                <span className="font-semibold text-white">${order.tax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-neutral-800 flex justify-between text-sm font-bold text-white">
                <span>Total Due</span>
                <span className="text-base text-amber-400">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Client and Shipping Details (1 col) */}
        <div className="space-y-6">
          <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>Client Profile</span>
            </h3>
            <div className="text-xs space-y-1">
              <p className="font-semibold text-white">{order.customerName}</p>
              <p className="text-neutral-400">{order.email}</p>
              <p className="text-neutral-400">{order.phone}</p>
            </div>
          </div>

          <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Delivery Handover Address</span>
            </h3>
            <div className="text-xs text-neutral-300 space-y-1">
              <p className="font-semibold text-white">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="pt-1 text-neutral-400">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Payment Details</span>
            </h3>
            <div className="text-xs space-y-2">
              <p className="text-neutral-300">Method: <strong className="text-white">{order.paymentMethod}</strong></p>
              <p className="text-neutral-300">
                Payment Status: <span className="uppercase font-bold text-emerald-400">{order.paymentStatus}</span>
              </p>
              {order.notes && (
                <div className="pt-2 border-t border-neutral-800">
                  <p className="text-[11px] text-neutral-500 font-semibold">Special Client Note:</p>
                  <p className="text-xs text-neutral-300 mt-0.5">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
