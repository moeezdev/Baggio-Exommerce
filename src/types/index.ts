export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  status: 'Active' | 'Disabled' | 'active' | 'disabled';
  createdAt?: string;
}

export type Customer = User & {
  ordersCount?: number;
  totalSpent?: number;
};

export interface Address {
  id?: string;
  userId?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: 'active' | 'inactive';
  sortOrder?: number;
  parentId?: string | null;
  createdAt?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  size?: string;
  color?: string;
  price: number;
  stockQuantity: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  brand: string;
  regularPrice: number;
  salePrice?: number | null;
  costPrice?: number;
  tax?: number;
  discount?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  images: ProductImage[];
  variants: ProductVariant[];
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  seoTitle?: string;
  seoDescription?: string;
  status: 'active' | 'draft' | 'out_of_stock' | 'archived';
  featured: boolean;
  isNew: boolean;
  bestSeller: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  productImage: string;
  variantName?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  orderStatus: OrderStatus;
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  total: number;
  couponCode?: string;
  items: OrderItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  status: 'approved' | 'hidden' | 'pending';
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  maxDiscountAmount?: number;
  startDate?: string;
  expiryDate?: string;
  expiresAt?: string;
  usageLimit?: number;
  usageCount?: number;
  usedCount?: number;
  status?: 'active' | 'inactive';
  isActive?: boolean;
  createdAt?: string;
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  subtitle?: string;
  image?: string;
  imageUrl?: string;
  buttonText?: string;
  ctaText?: string;
  buttonUrl?: string;
  ctaLink?: string;
  type?: 'hero' | 'promo';
  status?: 'active' | 'inactive';
  isActive?: boolean;
  sortOrder?: number;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  logo: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  country: string;
  timezone: string;
  shippingFee: number;
  freeShippingThreshold: number;
  taxPercentage: number;
  enableCod: boolean;
  cancellationRules: string;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  recentOrders: Order[];
  salesChart: Array<{ date: string; sales: number; orders: number }>;
  topSellingProducts: Array<{ name: string; quantity: number; revenue: number }>;
  salesByCategory: Array<{ name: string; value: number }>;
}

export interface ReportData {
  range: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  bestSellingProducts: Array<{ name: string; quantity: number; revenue: number }>;
  bestCategories: Array<{ name: string; revenue: number }>;
  customerGrowth: number;
}
