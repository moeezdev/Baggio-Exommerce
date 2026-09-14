import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  ChevronRight,
  Clock,
  CreditCard,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminOrdersPageProps {
  navigate: (path: string) => void;
}

export const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({ navigate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await api.adminGetOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined,
        limit: 100,
      });
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleQuickStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await api.adminUpdateOrderStatus(orderId, newStatus);
      success(`Order updated to ${newStatus}`);
      fetchOrders();
    } catch (err: any) {
      error(err.message || 'Failed to update order status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white">Commissioned Orders</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Track client purchase transactions, fulfillment statuses, and courier handovers.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number or client..."
            className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 text-xs text-white rounded-xl focus:outline-none focus:border-amber-400"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Status Tabs */}
          {(['all', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-400">Loading order registers...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">No matching orders located.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-neutral-400 uppercase tracking-wider text-[10px] bg-neutral-900/60 border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Articles</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">{ord.orderNumber}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-neutral-200">{ord.customerName}</p>
                      <p className="text-[11px] text-neutral-400">{ord.email}</p>
                    </td>
                    <td className="py-3 px-4 text-neutral-400">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-neutral-300">
                      {ord.items.length} {ord.items.length === 1 ? 'article' : 'articles'}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">${ord.total.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] text-neutral-300 block">{ord.paymentMethod}</span>
                      <span
                        className={`text-[10px] uppercase font-bold ${
                          ord.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleQuickStatusUpdate(ord.id, e.target.value)}
                        className="bg-neutral-900 border border-neutral-700 text-[11px] font-semibold rounded px-2.5 py-1 text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/orders/${ord.id}`)}
                        className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                        title="View Full Dossier"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
