import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DashboardStats, Order } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
}

const COLORS = ['#d97706', '#2563eb', '#10b981', '#8b5cf6', '#ec4899'];

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  const fetchStats = async () => {
    try {
      const data = await api.adminDashboard();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.adminUpdateOrderStatus(orderId, newStatus);
      success(`Order updated to ${newStatus}`);
      fetchStats();
    } catch (err: any) {
      error(err.message || 'Failed to update order status');
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-neutral-800/60 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-80 bg-neutral-800/60 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
            Operations Executive Overview
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time synchronization across Florence & international nodes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/products/new')}
            className="px-3.5 py-2 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Key Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Total Revenue
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">
              ${stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              Live DB
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Total Orders
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{stats.totalOrders}</span>
            <span className="text-[11px] font-semibold text-neutral-400">
              {stats.pendingOrders} pending
            </span>
          </div>
        </div>

        {/* Registered Clients */}
        <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Active Clients
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{stats.totalCustomers}</span>
            <span className="text-[11px] font-semibold text-emerald-400">Registered accounts</span>
          </div>
        </div>

        {/* Inventory Stock Warning */}
        <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Catalog Items
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{stats.totalProducts}</span>
            {stats.lowStockProducts > 0 ? (
              <span
                onClick={() => navigate('/admin/inventory')}
                className="text-[11px] font-bold text-amber-400 cursor-pointer hover:underline flex items-center gap-1"
              >
                <AlertTriangle className="w-3 h-3" />
                {stats.lowStockProducts} low stock
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-400">Stock optimal</span>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Orders Area Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Revenue Trajectory</h3>
              <p className="text-xs text-neutral-400">Recent registered transaction history</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {stats.salesChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.salesChart}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#737373" fontSize={11} tickLine={false} />
                  <YAxis stroke="#737373" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-neutral-800 rounded-xl">
                <p className="text-xs font-semibold text-neutral-300">No Transaction Data</p>
                <p className="text-[11px] text-neutral-500 mt-1 max-w-xs">
                  Revenue and daily commission volume will graph automatically here when customer orders are received.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sales by Category (1 col) */}
        <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Guild Distribution</h3>
            <p className="text-xs text-neutral-400">Sales share by category</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {stats.salesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.salesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-neutral-500">No category transactions logged yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Selling Products & Recent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products List (1 col) */}
        <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-white">Top Performing Articles</h3>
          <div className="divide-y divide-neutral-900">
            {stats.topSellingProducts.length > 0 ? (
              stats.topSellingProducts.map((p, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-neutral-200 truncate max-w-[180px]">{p.name}</p>
                    <p className="text-[11px] text-neutral-400">{p.quantity} units fulfilled</p>
                  </div>
                  <span className="font-bold text-amber-400">${p.revenue.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 py-4">No top articles yet.</p>
            )}
          </div>
        </div>

        {/* Recent Orders with Live Status Selector (2 cols) */}
        <div className="lg:col-span-2 p-6 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Recent Commissions</h3>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-neutral-400 uppercase tracking-wider text-[10px] border-b border-neutral-800">
                <tr>
                  <th className="pb-3 font-semibold">Order</th>
                  <th className="pb-3 font-semibold">Client</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-500 text-xs">
                      No customer orders have been recorded yet. Live orders will populate here automatically.
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3 font-mono font-bold text-white">{order.orderNumber}</td>
                      <td className="py-3 text-neutral-300 truncate max-w-[140px]">{order.customerName}</td>
                      <td className="py-3 font-semibold text-white">${order.total.toFixed(2)}</td>
                      <td className="py-3">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="bg-neutral-900 border border-neutral-700 text-[11px] font-semibold rounded px-2 py-1 text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          className="p-1.5 text-neutral-400 hover:text-white"
                          title="View details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
