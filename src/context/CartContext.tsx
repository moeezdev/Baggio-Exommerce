import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart, CartItem, Product, Coupon, StoreSettings } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';
import { useToast } from './ToastContext.tsx';

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  freeShippingThreshold: number;
  discount: number;
  tax: number;
  total: number;
  appliedCoupon: Coupon | null;
  isLoading: boolean;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  addToCart: (product: Product, quantity?: number, variantId?: string) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
  storeSettings: StoreSettings | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  const { user } = useAuth();
  const { success, error } = useToast();

  const refreshCart = useCallback(async () => {
    try {
      const data = await api.getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
    api.getStoreSettings()
      .then(setStoreSettings)
      .catch((err) => console.error('Failed to load store settings:', err));
  }, [user, refreshCart]);

  const items = cart?.items || [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.price || item.product?.salePrice || item.product?.regularPrice || 0;
    return sum + unitPrice * item.quantity;
  }, 0);

  const freeShippingThreshold = storeSettings?.freeShippingThreshold ?? 5000;
  const baseShippingFee = storeSettings?.shippingFee ?? 250;
  const shippingFee = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : baseShippingFee;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxRate = (storeSettings?.taxPercentage ?? 0) / 100;
  const tax = Math.round(taxableAmount * taxRate);
  const total = Math.round(taxableAmount + shippingFee + tax);

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);

  const addToCart = async (product: Product, quantity = 1, variantId?: string): Promise<boolean> => {
    if (product.stockQuantity <= 0) {
      error(`"${product.name}" is currently out of stock.`);
      return false;
    }

    try {
      let price = product.salePrice ?? product.regularPrice;
      if (variantId && product.variants) {
        const variant = product.variants.find((v) => v.id === variantId);
        if (variant) price = variant.price;
      }

      const updatedCart = await api.addToCart({
        productId: product.id,
        variantId,
        quantity,
        price,
      });
      setCart(updatedCart);
      setIsCartDrawerOpen(true);
      return true;
    } catch (err: any) {
      error(err.message || 'Failed to add item to bag.');
      return false;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const updatedCart = await api.updateCartItem(itemId, quantity);
      setCart(updatedCart);
    } catch (err: any) {
      error(err.message || 'Failed to update item quantity.');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const updatedCart = await api.removeFromCart(itemId);
      setCart(updatedCart);
      success('Item removed from bag.');
    } catch (err: any) {
      error(err.message || 'Failed to remove item.');
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      setCart((prev) => (prev ? { ...prev, items: [] } : null));
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } catch (err: any) {
      console.error('Failed to clear cart:', err);
    }
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.valid) {
        setAppliedCoupon(res.coupon);
        setDiscountAmount(res.discount);
        success(res.message || 'Coupon code applied!');
        return true;
      } else {
        error(res.message || 'Invalid coupon.');
        return false;
      }
    } catch (err: any) {
      error(err.message || 'Failed to validate coupon.');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    success('Coupon removed.');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        subtotal,
        shippingFee,
        freeShippingThreshold,
        discount: discountAmount,
        tax,
        total,
        appliedCoupon,
        isLoading,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
        storeSettings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
