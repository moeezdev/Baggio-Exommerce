import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { Category, Product } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { ProductCard } from '../../components/store/ProductCard.tsx';

interface CategoryPageProps {
  categorySlug: string;
  navigate: (path: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ categorySlug, navigate }) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCategoryAndProducts = async () => {
      setIsLoading(true);
      try {
        const catData = await api.getCategoryById(categorySlug);
        setCategory(catData.category);

        const prodData = await api.getProducts({
          categoryId: catData.category.id,
          limit: 30,
        });
        setProducts(prodData.products || []);
      } catch (err) {
        console.error('Category page fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategoryAndProducts();
  }, [categorySlug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse">
        <div className="h-64 bg-neutral-100 rounded-3xl mb-12"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[4/5] bg-neutral-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold text-neutral-900">Category Not Found</h2>
        <button
          onClick={() => navigate('/categories')}
          className="mt-4 px-5 py-2.5 bg-neutral-950 text-white text-xs font-semibold rounded-lg"
        >
          View All Categories
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-6">
        <button onClick={() => navigate('/')} className="hover:text-black">Home</button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => navigate('/categories')} className="hover:text-black">Categories</button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neutral-900 font-medium">{category.name}</span>
      </nav>

      {/* Hero Category Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-950 text-white min-h-[260px] flex items-center mb-12">
        <img
          src={category.image}
          alt={category.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="relative p-8 sm:p-12 max-w-2xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            Artisan Discipline
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
            {category.name}
          </h1>
          <p className="text-sm text-neutral-300 leading-relaxed font-light">
            {category.description}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-100">
          <h2 className="text-base font-bold text-neutral-900">
            {products.length} {products.length === 1 ? 'Article' : 'Articles'} Available
          </h2>
          <button
            onClick={() => navigate('/shop')}
            className="text-xs font-semibold text-neutral-600 hover:text-black"
          >
            Browse All Catalog →
          </button>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center bg-neutral-50 rounded-2xl">
            <p className="text-sm font-semibold text-neutral-800">No goods currently listed in this category</p>
            <p className="text-xs text-neutral-500 mt-1">Our craft team is preparing new limited editions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
