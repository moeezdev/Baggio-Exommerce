import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Category } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface CategoriesPageProps {
  navigate: (path: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ navigate }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          The Craft Divisions
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-950 mt-1">
          Baggio Guilds & Disciplines
        </h1>
        <p className="text-sm text-neutral-500 mt-2">
          Explore specialized collections made with master leatherworkers and horological artisans.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] bg-neutral-100 rounded-2xl"></div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-100 max-w-xl mx-auto p-8">
          <p className="text-base font-serif font-bold text-neutral-900">Guild Categories Initializing</p>
          <p className="text-xs text-neutral-500 mt-2">
            No categories have been published to the storefront yet. You can create categories and assign products in the Admin OS.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="mt-6 px-6 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-full hover:bg-neutral-800 transition-colors"
          >
            Explore All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/category/${cat.slug}`)}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer bg-neutral-100 shadow-sm hover:shadow-2xl transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <h3 className="text-xl font-serif font-bold group-hover:text-amber-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <span>Explore Discipline</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
