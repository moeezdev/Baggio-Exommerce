import React, { useState } from 'react';
import { Mail, Check, ChevronDown, Plus, Minus, ShieldCheck } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-neutral-950 text-neutral-300 pt-16 pb-12 border-t border-neutral-900 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Grid Layout */}
        <div className="hidden lg:grid grid-cols-12 gap-10 pb-14 border-b border-neutral-800/80">
          {/* Brand Column */}
          <div className="col-span-4 space-y-4">
            <span className="text-2xl font-serif font-black tracking-[0.2em] text-white uppercase">
              BAGGIO
            </span>
            <p className="text-xs font-serif italic text-neutral-400 tracking-wider">
              Style that speaks for itself.
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Artisan luxury goods, chronographs, and leather essentials handcrafted for discerning clients worldwide.
            </p>
            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-widest text-neutral-500 block mb-2 font-semibold">
                Follow Us
              </span>
              <div className="flex gap-4 text-xs tracking-wider text-neutral-400 font-semibold">
                <a href="#instagram" className="hover:text-white transition-colors">Instagram</a>
                <a href="#facebook" className="hover:text-white transition-colors">Facebook</a>
                <a href="#tiktok" className="hover:text-white transition-colors">TikTok</a>
              </div>
            </div>
          </div>

          {/* Shop Column */}
          <div className="col-span-2">
            <h5 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Shop
            </h5>
            <ul className="space-y-2.5 text-xs text-neutral-400 tracking-wider uppercase font-medium">
              <li>
                <button
                  onClick={() => navigate('/shop?isNew=true')}
                  className="hover:text-white transition-colors"
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/shop?bestSeller=true')}
                  className="hover:text-white transition-colors"
                >
                  Best Sellers
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/shop')}
                  className="hover:text-white transition-colors"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/categories')}
                  className="hover:text-white transition-colors"
                >
                  Categories
                </button>
              </li>
            </ul>
          </div>

          {/* Help Column */}
          <div className="col-span-2">
            <h5 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Help
            </h5>
            <ul className="space-y-2.5 text-xs text-neutral-400 tracking-wider uppercase font-medium">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Contact
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Shipping Policy
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Returns & Exchange
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  FAQs
                </span>
              </li>
            </ul>
          </div>

          {/* Account Column */}
          <div className="col-span-2">
            <h5 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Account
            </h5>
            <ul className="space-y-2.5 text-xs text-neutral-400 tracking-wider uppercase font-medium">
              <li>
                <button
                  onClick={() => navigate('/account')}
                  className="hover:text-white transition-colors"
                >
                  My Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/account/orders')}
                  className="hover:text-white transition-colors"
                >
                  Orders & Tracking
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/wishlist')}
                  className="hover:text-white transition-colors"
                >
                  Wishlist
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="hover:text-amber-400 text-amber-500/90 transition-colors flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin OS</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="col-span-2">
            <h5 className="text-xs font-bold uppercase tracking-widest text-white mb-2">
              Join The Baggio Community
            </h5>
            <p className="text-[11px] text-neutral-400 mb-3 leading-relaxed">
              Sign up for private sales, new release drops, and bespoke styling edits.
            </p>

            {isSubscribed ? (
              <div className="p-3 bg-neutral-900 border border-neutral-800 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Thank you for subscribing.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Mobile Accordion Layout (Requirement 21) */}
        <div className="lg:hidden space-y-4 pb-10 border-b border-neutral-800/80">
          <div className="space-y-2 mb-6">
            <span className="text-2xl font-serif font-black tracking-[0.2em] text-white uppercase block">
              BAGGIO
            </span>
            <p className="text-xs font-serif italic text-neutral-400">
              Style that speaks for itself.
            </p>
          </div>

          {/* Shop Section */}
          <div className="border-b border-neutral-800 pb-3">
            <button
              onClick={() => toggleSection('shop')}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white py-1"
            >
              <span>Shop</span>
              {openSections['shop'] ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
            {openSections['shop'] && (
              <ul className="mt-3 space-y-2.5 text-xs text-neutral-400 uppercase tracking-wider pl-2 animate-in slide-in-from-top-1 duration-150">
                <li>
                  <button onClick={() => navigate('/shop?isNew=true')} className="hover:text-white">
                    New Arrivals
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/shop?bestSeller=true')} className="hover:text-white">
                    Best Sellers
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/shop')} className="hover:text-white">
                    All Products
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/categories')} className="hover:text-white">
                    Categories
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Help Section */}
          <div className="border-b border-neutral-800 pb-3">
            <button
              onClick={() => toggleSection('help')}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white py-1"
            >
              <span>Help</span>
              {openSections['help'] ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
            {openSections['help'] && (
              <ul className="mt-3 space-y-2.5 text-xs text-neutral-400 uppercase tracking-wider pl-2 animate-in slide-in-from-top-1 duration-150">
                <li className="cursor-pointer hover:text-white">Contact</li>
                <li className="cursor-pointer hover:text-white">Shipping Policy</li>
                <li className="cursor-pointer hover:text-white">Returns & Exchange</li>
                <li className="cursor-pointer hover:text-white">FAQs</li>
              </ul>
            )}
          </div>

          {/* Account Section */}
          <div className="border-b border-neutral-800 pb-3">
            <button
              onClick={() => toggleSection('account')}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white py-1"
            >
              <span>Account</span>
              {openSections['account'] ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
            {openSections['account'] && (
              <ul className="mt-3 space-y-2.5 text-xs text-neutral-400 uppercase tracking-wider pl-2 animate-in slide-in-from-top-1 duration-150">
                <li>
                  <button onClick={() => navigate('/account')} className="hover:text-white">
                    My Account
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/account/orders')} className="hover:text-white">
                    Orders & Tracking
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/wishlist')} className="hover:text-white">
                    Wishlist
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/admin/dashboard')} className="text-amber-400 hover:text-amber-300">
                    Admin OS
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Mobile Newsletter */}
          <div className="pt-4">
            <h5 className="text-xs font-bold uppercase tracking-widest text-white mb-2">
              Join The Baggio Community
            </h5>
            <p className="text-[11px] text-neutral-400 mb-3">
              Sign up for private sales and drops.
            </p>
            {isSubscribed ? (
              <div className="p-3 bg-neutral-900 border border-neutral-800 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Thank you for subscribing.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-white text-neutral-950 text-xs font-bold tracking-widest uppercase"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

          {/* Socials */}
          <div className="pt-4 flex gap-4 text-xs uppercase tracking-wider text-neutral-400 font-semibold">
            <a href="#instagram" className="hover:text-white">Instagram</a>
            <a href="#facebook" className="hover:text-white">Facebook</a>
            <a href="#tiktok" className="hover:text-white">TikTok</a>
          </div>
        </div>

        {/* Bottom Legal & Payment Icons */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} BAGGIO. All rights reserved.</p>

          <div className="flex items-center space-x-6">
            <span className="hover:text-neutral-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-neutral-400 cursor-pointer">Terms & Conditions</span>
          </div>

          {/* Payment Badges */}
          <div className="flex items-center gap-2 text-[10px] text-neutral-400 uppercase tracking-widest font-mono">
            <span className="px-2 py-1 bg-neutral-900 border border-neutral-800">COD</span>
            <span className="px-2 py-1 bg-neutral-900 border border-neutral-800">VISA</span>
            <span className="px-2 py-1 bg-neutral-900 border border-neutral-800">MASTERCARD</span>
            <span className="px-2 py-1 bg-neutral-900 border border-neutral-800">BANK PAY</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
