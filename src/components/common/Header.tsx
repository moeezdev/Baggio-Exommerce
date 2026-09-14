import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  ExternalLink,
  LogOut,
  Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { Category } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { AnnouncementBanner } from '../store/AnnouncementBanner.tsx';
import { SearchOverlay } from '../store/SearchOverlay.tsx';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, navigate }) => {
  const { user, logout } = useAuth();
  const { itemCount, openCartDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isCategoriesHovered, setIsCategoriesHovered] = useState(false);
  const [isMobileCatExpanded, setIsMobileCatExpanded] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  const navLinks = [
    { name: 'SHOP', path: '/shop' },
    { name: 'CATEGORIES', path: '/categories', hasDropdown: true },
    { name: 'NEW ARRIVALS', path: '/shop?isNew=true' },
    { name: 'BEST SELLERS', path: '/shop?bestSeller=true' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-colors">
        {/* Slim Top Announcement Banner */}
        <AnnouncementBanner />

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Desktop LEFT: Brand Logo */}
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-neutral-900 hover:text-black transition-colors"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6 stroke-[1.5]" /> : <Menu className="w-6 h-6 stroke-[1.5]" />}
              </button>

              <div
                onClick={() => navigate('/')}
                className="cursor-pointer select-none group"
              >
                <span className="text-2xl sm:text-3xl font-serif font-black tracking-[0.2em] text-neutral-950 uppercase">
                  BAGGIO
                </span>
              </div>
            </div>

            {/* Desktop CENTER: Navigation Links with underline hover effect */}
            <nav className="hidden lg:flex items-center space-x-9">
              {navLinks.map((link) => {
                const isActive =
                  currentPath === link.path ||
                  (link.path === '/shop' && currentPath === '/shop' && !window.location.search);

                if (link.hasDropdown) {
                  return (
                    <div
                      key={link.name}
                      className="relative py-6"
                      onMouseEnter={() => setIsCategoriesHovered(true)}
                      onMouseLeave={() => setIsCategoriesHovered(false)}
                    >
                      <button
                        onClick={() => navigate('/categories')}
                        className={`group relative text-xs font-semibold tracking-widest transition-colors py-1 flex items-center gap-1 ${
                          currentPath.startsWith('/categor') ? 'text-neutral-950' : 'text-neutral-700 hover:text-neutral-950'
                        }`}
                      >
                        <span>{link.name}</span>
                        <ChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />
                        <span
                          className={`absolute bottom-0 left-0 h-[1.5px] bg-neutral-950 transition-all duration-300 ${
                            currentPath.startsWith('/categor') ? 'w-full' : 'w-0 group-hover:w-full'
                          }`}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      {isCategoriesHovered && (
                        <div className="absolute top-full left-0 w-64 bg-white border border-neutral-200 shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                          <div className="px-4 py-1 text-[10px] font-bold tracking-widest uppercase text-neutral-400">
                            Atelier Guilds
                          </div>
                          {categories.length > 0 ? (
                            categories.map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => {
                                  navigate(`/category/${cat.slug}`);
                                  setIsCategoriesHovered(false);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 transition-colors uppercase tracking-wider"
                              >
                                {cat.name}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-xs text-neutral-400">
                              Catalog initializing
                            </div>
                          )}
                          <div className="border-t border-neutral-100 mt-2 pt-2">
                            <button
                              onClick={() => {
                                navigate('/categories');
                                setIsCategoriesHovered(false);
                              }}
                              className="w-full text-left px-4 py-1.5 text-[11px] font-bold text-neutral-950 hover:bg-neutral-50 transition-colors uppercase tracking-widest"
                            >
                              View All Categories →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={link.name}
                    onClick={() => navigate(link.path)}
                    className={`group relative text-xs font-semibold tracking-widest transition-colors py-1 ${
                      isActive ? 'text-neutral-950' : 'text-neutral-700 hover:text-neutral-950'
                    }`}
                  >
                    <span>{link.name}</span>
                    <span
                      className={`absolute bottom-0 left-0 h-[1.5px] bg-neutral-950 transition-all duration-300 ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </button>
                );
              })}
            </nav>

            {/* Desktop RIGHT: Search SVG, Account SVG, Wishlist SVG, Bag SVG */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Search Icon */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-neutral-800 hover:text-black transition-transform active:scale-95"
                title="Search Products"
                aria-label="Search"
              >
                <Search className="w-5 h-5 stroke-[1.5]" />
              </button>

              {/* Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="p-2 text-neutral-800 hover:text-black transition-transform active:scale-95 flex items-center"
                  title="Account"
                  aria-label="Account"
                >
                  <UserIcon className="w-5 h-5 stroke-[1.5]" />
                </button>

                {isAccountMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-60 bg-white border border-neutral-200 shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setIsAccountMenuOpen(false)}
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-neutral-100">
                          <p className="text-[10px] uppercase tracking-widest text-neutral-400">
                            Signed in as
                          </p>
                          <p className="text-xs font-bold text-neutral-950 truncate uppercase tracking-wider">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            navigate('/account');
                            setIsAccountMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 uppercase tracking-wider font-medium"
                        >
                          <UserIcon className="w-3.5 h-3.5" />
                          <span>My Account</span>
                        </button>
                        <button
                          onClick={() => {
                            navigate('/account/orders');
                            setIsAccountMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 uppercase tracking-wider font-medium"
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>Orders & Tracking</span>
                        </button>
                        <div className="border-t border-neutral-100 my-1"></div>
                        <button
                          onClick={() => {
                            logout();
                            setIsAccountMenuOpen(false);
                            navigate('/');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 uppercase tracking-wider font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <div className="p-4 space-y-3">
                        <p className="text-xs font-serif font-bold text-neutral-950 uppercase tracking-wide">
                          Welcome to Baggio
                        </p>
                        <p className="text-[11px] text-neutral-500 leading-relaxed">
                          Access your saved wishlist, manage delivery addresses, and track orders.
                        </p>
                        <button
                          onClick={() => {
                            navigate('/login');
                            setIsAccountMenuOpen(false);
                          }}
                          className="w-full py-2.5 bg-neutral-950 text-white text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => {
                            navigate('/register');
                            setIsAccountMenuOpen(false);
                          }}
                          className="w-full py-2 border border-neutral-300 text-neutral-800 text-xs font-semibold uppercase tracking-widest hover:border-neutral-900 transition-colors"
                        >
                          Create Account
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist Icon */}
              <button
                onClick={() => navigate('/wishlist')}
                className="p-2 text-neutral-800 hover:text-black transition-transform active:scale-95 relative"
                title="Wishlist"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 stroke-[1.5]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-neutral-950 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Shopping Bag Icon */}
              <button
                onClick={openCartDrawer}
                className="p-2 text-neutral-900 hover:text-black transition-transform active:scale-95 relative flex items-center"
                title="Shopping Bag"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-neutral-950 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Quick Admin OS Access */}
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-600 hover:text-neutral-950 border border-neutral-200 hover:border-neutral-950 transition-colors ml-2"
                title="Open Baggio Admin OS"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer Menu (Requirement 22) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => {
                navigate('/shop');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-semibold tracking-widest uppercase text-neutral-900 border-b border-neutral-100"
            >
              Shop All
            </button>

            {/* Expandable Categories */}
            <div>
              <button
                onClick={() => setIsMobileCatExpanded(!isMobileCatExpanded)}
                className="flex items-center justify-between w-full py-2 text-sm font-semibold tracking-widest uppercase text-neutral-900 border-b border-neutral-100"
              >
                <span>Categories</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isMobileCatExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isMobileCatExpanded && (
                <div className="pl-4 py-2 space-y-2 border-l border-neutral-200 my-2">
                  <button
                    onClick={() => {
                      navigate('/categories');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block text-xs font-bold text-neutral-900 uppercase tracking-wider py-1"
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        navigate(`/category/${cat.slug}`);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block text-xs text-neutral-600 hover:text-black py-1 uppercase tracking-wider"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                navigate('/shop?isNew=true');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-semibold tracking-widest uppercase text-neutral-900 border-b border-neutral-100"
            >
              New Arrivals
            </button>

            <button
              onClick={() => {
                navigate('/shop?bestSeller=true');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-semibold tracking-widest uppercase text-neutral-900 border-b border-neutral-100"
            >
              Best Sellers
            </button>

            <button
              onClick={() => {
                navigate(user ? '/account' : '/login');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-semibold tracking-widest uppercase text-neutral-900 border-b border-neutral-100"
            >
              Account
            </button>

            <button
              onClick={() => {
                navigate('/wishlist');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-semibold tracking-widest uppercase text-neutral-900 border-b border-neutral-100"
            >
              Wishlist ({wishlistCount})
            </button>

            <div className="pt-4 border-t border-neutral-200">
              <button
                onClick={() => {
                  navigate('/admin/dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-xs font-bold text-neutral-900 uppercase tracking-widest"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Switch to Admin OS</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Live Animated Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        navigate={navigate}
      />
    </>
  );
};
