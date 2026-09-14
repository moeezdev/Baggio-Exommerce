import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext.tsx';
import { formatPrice } from '../../utils/currency.ts';
import { api } from '../../services/api.ts';
import { Banner } from '../../types/index.ts';
import { Sparkles } from 'lucide-react';

export const AnnouncementBanner: React.FC = () => {
  const { freeShippingThreshold, storeSettings } = useCart();
  const [promoBanners, setPromoBanners] = useState<Banner[]>([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  useEffect(() => {
    api.getBanners('promo')
      .then((banners) => {
        if (Array.isArray(banners) && banners.length > 0) {
          setPromoBanners(banners);
        }
      })
      .catch(console.error);
  }, []);

  // Cycle between default free shipping announcement and backend promotional banners if any
  const announcements: string[] = [
    `COMPLIMENTARY SHIPPING ON ALL ORDERS OVER ${formatPrice(freeShippingThreshold)}`,
    'ARCHIVAL LEATHER GOODS & CHRONOGRAPHS — CRAFTED TO ENDURE',
    'EXPRESS COURIER DELIVERY & 30-DAY COMPLIMENTARY EVALUATION',
    ...(promoBanners.map((b) => b.title.toUpperCase())),
  ];

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  return (
    <div className="bg-neutral-950 text-neutral-200 border-b border-neutral-900 py-2 px-4 select-none overflow-hidden relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
        <div className="flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase transition-opacity duration-500 ease-in-out">
          <Sparkles className="w-3 h-3 text-amber-400 shrink-0 animate-pulse" />
          <span className="font-semibold text-neutral-100">
            {announcements[currentPromoIndex]}
          </span>
        </div>
      </div>
    </div>
  );
};
