import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';
import { useToast } from './ToastContext.tsx';

interface WishlistContextType {
  wishlist: Product[];
  count: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const { user } = useAuth();
  const { success, info } = useToast();

  const refreshWishlist = useCallback(async () => {
    try {
      const items = await api.getWishlist();
      setWishlist(items);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    }
  }, []);

  useEffect(() => {
    refreshWishlist();
  }, [user, refreshWishlist]);

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  const toggleWishlist = async (product: Product) => {
    try {
      const res = await api.toggleWishlist(product.id);
      setWishlist(res.items);
      if (res.added) {
        success(`Saved "${product.name}" to wishlist.`);
      } else {
        info(`Removed "${product.name}" from wishlist.`);
      }
    } catch (err: any) {
      console.error('Wishlist error:', err);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const res = await api.toggleWishlist(productId);
      setWishlist(res.items);
      info('Item removed from wishlist.');
    } catch (err: any) {
      console.error('Wishlist remove error:', err);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        count: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
