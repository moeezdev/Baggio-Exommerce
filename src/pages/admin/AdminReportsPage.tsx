import React, { useState, useEffect } from 'react';
import {
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard,
  Package,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { DashboardStats } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

export const AdminReportsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'ytd'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const { success } = useToast();

  useEffect(() => {
    api.adminDashboard()
      .then(setStats)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleExportCSV = () => {
    if (!stats) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Total Revenue,$${stats.totalSales.toFixed(2)}\n` +
      `Total Orders,${stats.totalOrders}\n` +
      `Total Clients,${stats.totalCustomers}\n` +
      `Pending Orders,${stats.pendingOrders}\n` +
      `Active Catalog Products,${stats.totalProducts}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `baggio_financial_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Financial report exported to CSV.');
  };

  if (isLoading || !stats) {
    return <div className="p-12 text-center text-xs text-neutral-400">Loading intelligence models...</div>;
  }

  const averageOrderValue =
    stats.totalOrders > 0 ? stats.totalSales / stats.totalOrders : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white">Financial & Sales Intelligence</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Audit commerce revenues, average basket sizes, and order distributions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl border border-neutral-700 flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Dossier</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl">
          <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
            Total Gross Revenue
          </span>
          <p className="text-3xl font-bold text-white mt-1">
            ${stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl">
          <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
            Average Order Value (AOV)
          </span>
          <p className="text-3xl font-bold text-amber-400 mt-1">
            ${averageOrderValue.toFixed(2)}
          </p>
        </div>

        <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl">
          <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
            Settled Orders
          </span>
          <p className="text-3xl font-bold text-white mt-1">{stats.totalOrders}</p>
        </div>
      </div>

      {/* Trajectory Bar Chart */}
      <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold text-white">Gross Revenue Timeline</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.salesChart}>
              <XAxis dataKey="date" stroke="#737373" fontSize={11} tickLine={false} />
              <YAxis stroke="#737373" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717',
                  borderColor: '#262626',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="sales" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
