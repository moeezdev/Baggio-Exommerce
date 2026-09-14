import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';

// Common Store Layout
import { Header } from './components/common/Header.tsx';
import { Footer } from './components/common/Footer.tsx';
import { CartDrawer } from './components/store/CartDrawer.tsx';

// Store Pages
import { HomePage } from './pages/store/HomePage.tsx';
import { ShopPage } from './pages/store/ShopPage.tsx';
import { ProductDetailPage } from './pages/store/ProductDetailPage.tsx';
import { CategoriesPage } from './pages/store/CategoriesPage.tsx';
import { CategoryPage } from './pages/store/CategoryPage.tsx';
import { CartPage } from './pages/store/CartPage.tsx';
import { CheckoutPage } from './pages/store/CheckoutPage.tsx';
import { OrderConfirmationPage } from './pages/store/OrderConfirmationPage.tsx';
import { AccountPage } from './pages/store/AccountPage.tsx';
import { OrderDetailsPage } from './pages/store/OrderDetailsPage.tsx';
import { WishlistPage } from './pages/store/WishlistPage.tsx';
import { AuthPages } from './pages/store/AuthPages.tsx';

// Admin Pages
import { AdminLayout } from './components/admin/AdminLayout.tsx';
import { AdminLoginPage } from './pages/admin/AdminLoginPage.tsx';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.tsx';
import { AdminProductsPage } from './pages/admin/AdminProductsPage.tsx';
import { AdminProductEditPage } from './pages/admin/AdminProductEditPage.tsx';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage.tsx';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage.tsx';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage.tsx';
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage.tsx';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage.tsx';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage.tsx';
import { AdminBannersPage } from './pages/admin/AdminBannersPage.tsx';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage.tsx';
import { AdminReportsPage } from './pages/admin/AdminReportsPage.tsx';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage.tsx';
import { Shield, Store } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <ToastProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans selection:bg-neutral-950 selection:text-white">
                {/* Global App Switcher Floating Pill for frictionless evaluation */}
                <aside aria-label="Application Switcher" className="fixed bottom-4 right-4 z-50 flex items-center bg-neutral-950/90 backdrop-blur-md text-white p-1 rounded-full shadow-2xl border border-neutral-800 text-xs">
                  <button
                    onClick={() => navigate('/')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                      !isAdminRoute
                        ? 'bg-white text-neutral-950 font-bold shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Baggio Store</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/dashboard')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                      isAdminRoute
                        ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin OS</span>
                  </button>
                </aside>

                {/* Routing Resolution */}
                {isAdminRoute ? (
                  <AdminAppRouter currentPath={currentPath} navigate={navigate} />
                ) : (
                  <StoreAppRouter currentPath={currentPath} navigate={navigate} />
                )}
              </div>
            </WishlistProvider>
          </CartProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

/**
 * Customer Storefront Router
 */
function StoreAppRouter({
  currentPath,
  navigate,
}: {
  currentPath: string;
  navigate: (path: string) => void;
}) {
  let content: React.ReactNode = null;

  if (currentPath === '/' || currentPath === '') {
    content = <HomePage navigate={navigate} />;
  } else if (currentPath.startsWith('/shop')) {
    const searchParams = Object.fromEntries(new URLSearchParams(window.location.search).entries());
    content = <ShopPage navigate={navigate} initialParams={searchParams} key={window.location.search} />;
  } else if (currentPath.startsWith('/product/')) {
    const productId = currentPath.replace('/product/', '').split('/')[0];
    content = <ProductDetailPage productId={productId} navigate={navigate} />;
  } else if (currentPath === '/categories') {
    content = <CategoriesPage navigate={navigate} />;
  } else if (currentPath.startsWith('/category/')) {
    const categorySlug = currentPath.replace('/category/', '').split('/')[0];
    content = <CategoryPage categorySlug={categorySlug} navigate={navigate} />;
  } else if (currentPath === '/cart') {
    content = <CartPage navigate={navigate} />;
  } else if (currentPath === '/checkout') {
    content = <CheckoutPage navigate={navigate} />;
  } else if (currentPath.startsWith('/order-confirmation/')) {
    const orderId = currentPath.replace('/order-confirmation/', '').split('/')[0];
    content = <OrderConfirmationPage orderId={orderId} navigate={navigate} />;
  } else if (currentPath.startsWith('/account/orders/')) {
    const orderId = currentPath.replace('/account/orders/', '').split('/')[0];
    content = <OrderDetailsPage orderId={orderId} navigate={navigate} />;
  } else if (currentPath === '/account' || currentPath === '/account/orders') {
    content = <AccountPage navigate={navigate} defaultTab="orders" />;
  } else if (currentPath === '/account/profile') {
    content = <AccountPage navigate={navigate} defaultTab="profile" />;
  } else if (currentPath === '/wishlist') {
    content = <WishlistPage navigate={navigate} />;
  } else if (currentPath === '/login') {
    content = <AuthPages mode="login" navigate={navigate} />;
  } else if (currentPath === '/register') {
    content = <AuthPages mode="register" navigate={navigate} />;
  } else if (currentPath === '/forgot-password') {
    content = <AuthPages mode="forgot" navigate={navigate} />;
  } else {
    // 404 fallback to home
    content = <HomePage navigate={navigate} />;
  }

  return (
    <>
      <Header navigate={navigate} currentPath={currentPath} />
      <main className="flex-1">{content}</main>
      <Footer navigate={navigate} />
      <CartDrawer navigate={navigate} />
    </>
  );
}

/**
 * Admin Management OS Router
 */
function AdminAppRouter({
  currentPath,
  navigate,
}: {
  currentPath: string;
  navigate: (path: string) => void;
}) {
  const { admin, isLoading } = useAdminAuth();

  if (currentPath === '/admin/login') {
    return <AdminLoginPage navigate={navigate} />;
  }

  // If not authenticated, prompt to sign in
  if (!isLoading && !admin) {
    return <AdminLoginPage navigate={navigate} />;
  }

  let adminContent: React.ReactNode = null;

  if (currentPath === '/admin' || currentPath === '/admin/dashboard') {
    adminContent = <AdminDashboardPage navigate={navigate} />;
  } else if (currentPath === '/admin/products') {
    adminContent = <AdminProductsPage navigate={navigate} />;
  } else if (currentPath === '/admin/products/new') {
    adminContent = <AdminProductEditPage productId="new" navigate={navigate} />;
  } else if (currentPath.startsWith('/admin/products/')) {
    const prodId = currentPath.replace('/admin/products/', '').split('/')[0];
    adminContent = <AdminProductEditPage productId={prodId} navigate={navigate} />;
  } else if (currentPath === '/admin/categories') {
    adminContent = <AdminCategoriesPage />;
  } else if (currentPath === '/admin/inventory') {
    adminContent = <AdminInventoryPage />;
  } else if (currentPath === '/admin/orders') {
    adminContent = <AdminOrdersPage navigate={navigate} />;
  } else if (currentPath.startsWith('/admin/orders/')) {
    const orderId = currentPath.replace('/admin/orders/', '').split('/')[0];
    adminContent = <AdminOrderDetailPage orderId={orderId} navigate={navigate} />;
  } else if (currentPath === '/admin/customers') {
    adminContent = <AdminCustomersPage />;
  } else if (currentPath === '/admin/coupons') {
    adminContent = <AdminCouponsPage />;
  } else if (currentPath === '/admin/banners') {
    adminContent = <AdminBannersPage />;
  } else if (currentPath === '/admin/reviews') {
    adminContent = <AdminReviewsPage />;
  } else if (currentPath === '/admin/reports') {
    adminContent = <AdminReportsPage />;
  } else if (currentPath === '/admin/settings') {
    adminContent = <AdminSettingsPage />;
  } else {
    adminContent = <AdminDashboardPage navigate={navigate} />;
  }

  return (
    <AdminLayout currentPath={currentPath} navigate={navigate}>
      {adminContent}
    </AdminLayout>
  );
}
