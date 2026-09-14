import React, { useState, useEffect } from 'react';
import { Users, Search, CheckCircle2, XCircle, ShoppingBag } from 'lucide-react';
import { Customer } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await api.adminGetCustomers({ search: search || undefined });
      setCustomers(data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (customer: Customer) => {
    try {
      const res = await api.adminToggleCustomerStatus(customer.id);
      success(`Client account is now ${res.customer.status}`);
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, status: res.customer.status } : c))
      );
    } catch (err: any) {
      error(err.message || 'Failed to update customer status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white">Client Directory</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Registered clientele, purchase history, and access privileges.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchCustomers();
          }}
          className="w-full sm:w-80 relative"
        >
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name or email..."
            className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 text-xs text-white rounded-xl focus:outline-none focus:border-amber-400"
          />
        </form>
      </div>

      {/* Customers Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-400">Loading client directory...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">No client records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-neutral-400 uppercase tracking-wider text-[10px] bg-neutral-900/60 border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Commissions</th>
                  <th className="py-3 px-4">Lifetime Spend</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{c.name}</p>
                      <p className="text-[11px] text-neutral-400">{c.email}</p>
                    </td>
                    <td className="py-3 px-4 text-neutral-400">{c.phone || '—'}</td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {c.ordersCount || 0} orders
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-400">
                      ${(c.totalSpent || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'Active'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          c.status === 'Active'
                            ? 'bg-neutral-900 text-rose-400 hover:bg-rose-950/50'
                            : 'bg-neutral-900 text-emerald-400 hover:bg-emerald-950/50'
                        }`}
                      >
                        {c.status === 'Active' ? 'Deactivate' : 'Activate'}
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
