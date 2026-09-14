import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ShoppingCart,
  Users,
  Tag,
  Image as ImageIcon,
  Star,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  Search,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext.tsx';
import { api } from '../../services/api.ts';

interface AdminLayoutProps {
  currentPath: string;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPath, navigate, children }) => {
  const { admin, adminLogout } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [badgeStats, setBadgeStats] = useState({ pendingOrders: 0, lowStockProducts: 0 });

  useEffect(() => {
    api.adminDashboard()
      .then((data) => {
        setBadgeStats({
          pendingOrders: data.pendingOrders || 0,
          lowStockProducts: data.lowStockProducts || 0,
        });
      })
      .catch(console.error);
  }, [currentPath]);

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    {
      label: 'Inventory',
      path: '/admin/inventory',
      icon: Boxes,
      badge: badgeStats.lowStockProducts > 0 ? badgeStats.lowStockProducts : undefined,
      badgeColor: 'bg-amber-500',
    },
    {
      label: 'Orders',
      path: '/admin/orders',
      icon: ShoppingCart,
      badge: badgeStats.pendingOrders > 0 ? badgeStats.pendingOrders : undefined,
      badgeColor: 'bg-emerald-500',
    },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Coupons', path: '/admin/coupons', icon: Tag },
    { label: 'Banners', path: '/admin/banners', icon: ImageIcon },
    { label: 'Reviews', path: '/admin/reviews', icon: Star },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-neutral-950 border-r border-neutral-800 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 flex flex-col justify-between ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Admin Badge */}
        <div>
          <div className="h-20 flex items-center justify-between px-6 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white text-neutral-950 flex items-center justify-center font-serif font-black text-lg">
                B
              </div>
              <div>
                <span className="font-serif font-black tracking-wider text-base text-white">BAGGIO</span>
                <span className="block text-[10px] font-semibold tracking-widest text-amber-400 uppercase">
                  Management OS
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Core Operations
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path !== '/admin/dashboard' && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold text-neutral-950 rounded-full ${item.badgeColor || 'bg-amber-400'}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Actions at Sidebar Bottom */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-xs text-amber-400">
                {admin?.name?.charAt(0) || 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{admin?.name || 'Store Director'}</p>
                <p className="text-[10px] text-neutral-400 truncate">{admin?.email || 'admin@baggio.com'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate('/')}
              className="py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-[11px] font-medium text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
              title="Open storefront in customer view"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Store</span>
            </button>
            <button
              onClick={() => {
                adminLogout();
                navigate('/admin/login');
              }}
              className="py-1.5 px-2 bg-neutral-900 hover:bg-rose-950/50 hover:text-rose-400 border border-neutral-700 rounded-lg text-[11px] font-medium text-neutral-400 flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top bar */}
        <header className="h-16 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-neutral-400 hover:text-white md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm sm:text-base font-semibold text-white">
              {navItems.find((item) => currentPath.startsWith(item.path))?.label || 'Administration'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/orders')}
              className="relative p-2 text-neutral-400 hover:text-white transition-colors"
              title="Orders notification"
            >
              <Bell className="w-4 h-4" />
              {badgeStats.pendingOrders > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => navigate('/')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-neutral-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Preview Customer Store</span>
            </button>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-4 sm:p-8 bg-neutral-900 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
