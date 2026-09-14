import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronRight, ChevronLeft, Sparkles, ArrowUpRight } from 'lucide-react';
import { Product, Category, Banner } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { ProductCard } from '../../components/store/ProductCard.tsx';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback editorial banner if no banners are registered in database yet
  const defaultHeroSlides = [
    {
      id: 'default_hero_1',
      title: 'ARCHIVAL CRAFTSMANSHIP & TIMELESS LUXURY',
      description:
        'Engineered in Florence with hand-finished Italian vegetable-tanned leathers and precision automatic calibres.',
      image:
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1920&auto=format&fit=crop',
      buttonText: 'SHOP NOW',
      buttonUrl: '/shop',
    },
    {
      id: 'default_hero_2',
      title: 'HERITAGE HOROLOGY: THE CALIBRE COLLECTION',
      description:
        'Exhibition sapphire crystal casebacks with mechanical automatic movements built to endure generations.',
      image:
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1920&auto=format&fit=crop',
      buttonText: 'EXPLORE TIMEPIECES',
      buttonUrl: '/shop',
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannerRes, catRes, featuredRes, newRes, bestRes] = await Promise.all([
          api.getBanners('hero'),
          api.getCategories(),
          api.getProducts({ featured: true, limit: 8 }),
          api.getProducts({ isNew: true, limit: 4 }),
          api.getProducts({ bestSeller: true, limit: 4 }),
        ]);

        setBanners(bannerRes.length > 0 ? bannerRes : (defaultHeroSlides as any));
        setCategories(catRes);
        setFeaturedProducts(featuredRes.products || []);
        setNewArrivals(newRes.products || []);
        setBestSellers(bestRes.products || []);
      } catch (err) {
        console.error('Home page data fetch error:', err);
        setBanners(defaultHeroSlides as any);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Automatic hero carousel cycle (Requirements 5 & 6)
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [banners.length]);

  const activeSlide = banners[currentBannerIndex] || defaultHeroSlides[0];

  const handlePrevSlide = () => {
    setCurrentBannerIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="space-y-20 sm:space-y-28 pb-24 select-none">
      {/* 5 & 6. HERO SECTION & HERO ANIMATION */}
      <section className="relative h-[85vh] min-h-[580px] max-h-[860px] w-full bg-neutral-950 overflow-hidden flex items-end border-b border-neutral-900">
        {/* Background images with smooth crossfade & zoom */}
        {banners.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentBannerIndex ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover object-center transition-transform duration-[7000ms] ease-out ${
                idx === currentBannerIndex ? 'scale-105' : 'scale-100'
              }`}
            />
            {/* Cinematic architectural gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-black/20" />
          </div>
        ))}

        {/* Hero Content Stage */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
          <div className="max-w-3xl space-y-5 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-[0.25em] uppercase">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Baggio Atelier Edition</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight uppercase leading-[1.08]">
              {activeSlide.title}
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed max-w-xl">
              {activeSlide.description}
            </p>

            <div className="pt-3 flex flex-wrap gap-4 items-center">
              <button
                id="hero-shop-btn"
                onClick={() => navigate(activeSlide.buttonUrl || '/shop')}
                className="px-8 py-4 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-3 active:scale-[0.98] shadow-2xl"
              >
                <span>{activeSlide.buttonText || 'SHOP NOW'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => navigate('/categories')}
                className="px-8 py-4 bg-transparent hover:bg-white/10 border border-white/40 text-white text-xs font-bold tracking-widest uppercase transition-all"
              >
                View Categories
              </button>
            </div>
          </div>

          {/* Controls & Slide Indicators */}
          {banners.length > 1 && (
            <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentBannerIndex(idx)}
                    className={`h-[2px] transition-all duration-300 ${
                      idx === currentBannerIndex ? 'w-10 bg-white' : 'w-4 bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next controls */}
              <div className="flex items-center gap-2 text-white">
                <button
                  onClick={handlePrevSlide}
                  className="p-2 border border-white/20 hover:border-white hover:bg-white/10 transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="p-2 border border-white/20 hover:border-white hover:bg-white/10 transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 7. CATEGORY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-4 border-b border-neutral-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Curated Disciplines
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-950 uppercase tracking-wide mt-1">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => navigate('/categories')}
            className="mt-2 sm:mt-0 text-xs font-bold text-neutral-900 hover:text-neutral-600 flex items-center gap-1.5 uppercase tracking-widest group"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 px-6 text-center border border-neutral-200 bg-neutral-50">
            <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-neutral-900">
              Catalog Initializing
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Categories added in the Baggio Admin OS will be rendered here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => navigate(`/category/${cat.slug}`)}
                className="group relative aspect-[3/4] overflow-hidden bg-neutral-100 cursor-pointer border border-neutral-200 transition-all"
              >
                {/* Image with zoom effect (Requirement 7) */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Dark overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/30 to-transparent group-hover:from-neutral-950/90 transition-all duration-300" />

                {/* Title moves slightly & arrow appears (Requirement 7) */}
                <div className="absolute bottom-4 left-4 right-4 text-white transform transition-transform duration-300 group-hover:-translate-y-1">
                  <h3 className="text-base sm:text-lg font-serif font-bold uppercase tracking-wider group-hover:text-white transition-colors">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-[11px] text-neutral-300 line-clamp-1 mt-0.5 opacity-90">
                      {cat.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-300 group-hover:text-white transition-colors">
                    <span>Explore</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 8 & 24. FEATURED PRODUCTS (4 per row desktop, 2 per row mobile) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-4 border-b border-neutral-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Selected Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-950 uppercase tracking-wide mt-1">
              Featured Creations
            </h2>
          </div>
          <button
            onClick={() => navigate('/shop?featured=true')}
            className="mt-2 sm:mt-0 text-xs font-bold text-neutral-900 hover:text-neutral-600 flex items-center gap-1.5 uppercase tracking-widest group"
          >
            <span>View All Featured</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-neutral-100 animate-pulse border border-neutral-200" />
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="py-16 px-6 text-center border border-neutral-200 bg-neutral-50">
            <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-neutral-900">
              Featured Catalog Under Curation
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto leading-relaxed">
              New featured products added via the Admin OS or sample catalog will be showcased here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} navigate={navigate} />
            ))}
          </div>
        )}
      </section>

      {/* EDITORIAL ATELIER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-950 text-white grid grid-cols-1 lg:grid-cols-2 items-center border border-neutral-900">
          <div className="p-8 sm:p-14 lg:p-20 space-y-6">
            <span className="text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase block">
              Atelier Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold uppercase leading-tight tracking-wide">
              Style That Speaks For Itself.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
              Every Baggio creation begins with hand-selected hides from certified Tuscan tanneries,
              treated only with organic chestnut extracts. Our horology pieces feature exhibition
              casebacks and anti-reflective sapphire crystals, assembled in strictly numbered editions.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-neutral-800">
              <div>
                <span className="text-xl font-serif font-bold text-white uppercase">Full-Grain</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Vegetable-Tanned Italian Hides</p>
              </div>
              <div>
                <span className="text-xl font-serif font-bold text-white uppercase">Calibre 40</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Mechanical Automatic Movements</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/shop')}
              className="mt-4 px-8 py-3.5 bg-white text-neutral-950 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
            >
              Shop All Creations
            </button>
          </div>

          <div className="relative h-80 lg:h-full min-h-[420px] bg-neutral-900">
            <img
              src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200&auto=format&fit=crop"
              alt="Artisan Watchmaker crafting Baggio timepieces"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-4 border-b border-neutral-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Fresh From Florence
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-950 uppercase tracking-wide mt-1">
              New Arrivals
            </h2>
          </div>
          <button
            onClick={() => navigate('/shop?isNew=true')}
            className="mt-2 sm:mt-0 text-xs font-bold text-neutral-900 hover:text-neutral-600 flex items-center gap-1.5 uppercase tracking-widest group"
          >
            <span>View All New</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {newArrivals.length === 0 ? (
          <div className="py-16 px-6 text-center border border-neutral-200 bg-neutral-50">
            <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-neutral-900">
              New Releases Forthcoming
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Seasonal additions and limited run capsules will be cataloged here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} navigate={navigate} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
