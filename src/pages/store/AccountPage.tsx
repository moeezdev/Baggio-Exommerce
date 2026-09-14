import React, { useState, useEffect } from 'react';
import {
  Package,
  User as UserIcon,
  KeyRound,
  MapPin,
  Clock,
  ChevronRight,
  LogOut,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { Order } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatPrice } from '../../utils/currency.ts';

interface AccountPageProps {
  navigate: (path: string) => void;
  defaultTab?: string;
}

export const AccountPage: React.FC<AccountPageProps> = ({ navigate, defaultTab = 'orders' }) => {
  const { user, logout, updateProfile } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'security'>(
    defaultTab === 'profile' ? 'profile' : 'orders'
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setName(user.name);
    setPhone(user.phone || '');

    api.getOrders()
      .then((res) => setOrders(res.orders || []))
      .catch(console.error)
      .finally(() => setIsLoadingOrders(false));
  }, [user, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await updateProfile({ name, phone });
      success('Client details saved.');
    } catch (err: any) {
      error(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      error('Please fill in both password fields.');
      return;
    }
    setIsChangingPassword(true);
    try {
      await api.customerChangePassword({ currentPassword, newPassword });
      success('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      error(err.message || 'Failed to update password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-amber-100 text-amber-800';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-neutral-100 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Client Portal
          </span>
          <h1 className="text-3xl font-serif font-bold text-neutral-950 mt-1">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">{user?.email}</p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
        {/* Navigation Sidebar */}
        <aside className="space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'orders'
                ? 'bg-neutral-950 text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4" />
              <span>Order History</span>
            </div>
            <span className="text-[11px] opacity-80">{orders.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'bg-neutral-950 text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile Information</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'security'
                ? 'bg-neutral-950 text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Password & Security</span>
          </button>
        </aside>

        {/* Content Panel (3 cols) */}
        <div className="md:col-span-3">
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-base font-serif font-bold text-neutral-950">
                Your Commissions & Orders
              </h2>

              {isLoadingOrders ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-neutral-100 rounded-xl"></div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center bg-neutral-50 rounded-2xl border border-neutral-100">
                  <Package className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-neutral-800">No orders registered yet</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Your completed commissions will appear here with live tracking.
                  </p>
                  <button
                    onClick={() => navigate('/shop')}
                    className="mt-4 px-5 py-2 bg-neutral-950 text-white text-xs font-semibold rounded-lg"
                  >
                    Explore Atelier Catalog
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => navigate(`/account/orders/${ord.id}`)}
                      className="p-5 bg-white rounded-xl border border-neutral-200/80 hover:border-neutral-400 shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-950">
                            {ord.orderNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(
                              ord.orderStatus
                            )}`}
                          >
                            {ord.orderStatus}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500">
                          Placed on {new Date(ord.createdAt).toLocaleDateString()} • {ord.items.length}{' '}
                          {ord.items.length === 1 ? 'article' : 'articles'}
                        </p>
                        <p className="text-xs font-semibold text-neutral-900 mt-1">
                          Total: {formatPrice(ord.total)} ({ord.paymentMethod})
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 self-end sm:self-center">
                        <span>View Order Dossier</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm max-w-xl">
              <h2 className="text-base font-serif font-bold text-neutral-950 mb-4">
                Client Profile Details
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email}
                    className="w-full px-3.5 py-2.5 bg-neutral-100 border border-neutral-200 rounded-lg text-xs text-neutral-500 cursor-not-allowed"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    Account email cannot be modified directly.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-2.5 bg-neutral-950 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm max-w-xl">
              <h2 className="text-base font-serif font-bold text-neutral-950 mb-4">
                Update Account Password
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-6 py-2.5 bg-neutral-950 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
