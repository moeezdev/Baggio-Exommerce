import fs from 'fs';
import path from 'path';
import {
  User,
  Product,
  Category,
  Cart,
  Order,
  Review,
  Coupon,
  Banner,
  StoreSettings,
  AuditLog,
  Address,
} from '../types.ts';
import {
  initialUsers,
  initialCategories,
  initialProducts,
  initialBanners,
  initialCoupons,
  initialStoreSettings,
  initialReviews,
  initialOrders,
} from './seedData.ts';

interface DatabaseSchema {
  users: User[];
  addresses: Address[];
  categories: Category[];
  products: Product[];
  carts: Cart[];
  wishlists: Record<string, string[]>; // userId/sessionId -> productIds[]
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  banners: Banner[];
  storeSettings: StoreSettings;
  auditLogs: AuditLog[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'baggio.db.json');

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || [...initialUsers],
          addresses: parsed.addresses || [],
          categories: parsed.categories || [...initialCategories],
          products: parsed.products || [...initialProducts],
          carts: parsed.carts || [],
          wishlists: parsed.wishlists || {},
          orders: parsed.orders || [...initialOrders],
          reviews: parsed.reviews || [...initialReviews],
          coupons: parsed.coupons || [...initialCoupons],
          banners: parsed.banners || [...initialBanners],
          storeSettings: parsed.storeSettings || { ...initialStoreSettings },
          auditLogs: parsed.auditLogs || [],
        };
      }
    } catch (err) {
      console.error('Failed to read db file, initializing with seed data:', err);
    }

    const adminOnly = initialUsers.filter((u) => u.role === 'admin');
    const defaultData: DatabaseSchema = {
      users: adminOnly.length ? adminOnly : [...initialUsers],
      addresses: [],
      categories: [],
      products: [],
      carts: [],
      wishlists: {},
      orders: [],
      reviews: [],
      coupons: [],
      banners: [],
      storeSettings: { ...initialStoreSettings },
      auditLogs: [],
    };

    this.saveDataDirect(defaultData);
    return defaultData;
  }

  public clearAllData() {
    const adminUsers = this.data.users.filter((u) => u.role === 'admin');
    this.data.users = adminUsers;
    this.data.addresses = [];
    this.data.categories = [];
    this.data.products = [];
    this.data.carts = [];
    this.data.wishlists = {};
    this.data.orders = [];
    this.data.reviews = [];
    this.data.coupons = [];
    this.data.banners = [];
    this.data.auditLogs = [];
    this.save();
    return { message: 'All mock data has been purged successfully.' };
  }

  public seedSampleCatalog() {
    this.data.categories = [...initialCategories];
    this.data.products = [...initialProducts];
    this.data.coupons = [...initialCoupons];
    this.data.banners = [...initialBanners];
    this.save();
    return { message: 'Sample catalog imported successfully.' };
  }

  private saveDataDirect(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to write db file:', err);
    }
  }

  public save() {
    this.saveDataDirect(this.data);
  }

  // --- USERS ---
  public getUsers() {
    return this.data.users;
  }

  public findUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.users[idx];
  }

  // --- PRODUCTS ---
  public getProducts(params?: {
    search?: string;
    categoryId?: string;
    categorySlug?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    status?: string;
    sort?: string;
    featured?: boolean;
    isNew?: boolean;
    bestSeller?: boolean;
    page?: number;
    limit?: number;
  }) {
    let items = [...this.data.products];

    // Status filter: default to 'active' for public, or allow any for admin
    if (params?.status && params.status !== 'all') {
      items = items.filter((p) => (p.status || 'active').toLowerCase() === params.status.toLowerCase());
    } else if (!params?.status) {
      items = items.filter((p) => (p.status || 'active').toLowerCase() === 'active');
    }

    if (params?.categorySlug) {
      const cat = this.data.categories.find((c) => c.slug === params.categorySlug);
      if (cat) {
        items = items.filter((p) => p.categoryId === cat.id);
      }
    } else if (params?.categoryId && params.categoryId !== 'all') {
      items = items.filter((p) => p.categoryId === params.categoryId);
    }

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q)
      );
    }

    if (params?.minPrice !== undefined) {
      items = items.filter((p) => {
        const effectivePrice = p.salePrice ?? p.regularPrice;
        return effectivePrice >= params.minPrice!;
      });
    }

    if (params?.maxPrice !== undefined) {
      items = items.filter((p) => {
        const effectivePrice = p.salePrice ?? p.regularPrice;
        return effectivePrice <= params.maxPrice!;
      });
    }

    if (params?.brand && params.brand !== 'all') {
      items = items.filter((p) => p.brand.toLowerCase() === params.brand!.toLowerCase());
    }

    if (params?.featured !== undefined) {
      items = items.filter((p) => p.featured === params.featured);
    }
    if (params?.isNew !== undefined) {
      items = items.filter((p) => p.isNew === params.isNew);
    }
    if (params?.bestSeller !== undefined) {
      items = items.filter((p) => p.bestSeller === params.bestSeller);
    }

    // Sorting
    switch (params?.sort) {
      case 'price-asc':
        items.sort((a, b) => (a.salePrice ?? a.regularPrice) - (b.salePrice ?? b.regularPrice));
        break;
      case 'price-desc':
        items.sort((a, b) => (b.salePrice ?? b.regularPrice) - (a.salePrice ?? a.regularPrice));
        break;
      case 'newest':
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        items.sort((a, b) => b.rating - a.rating);
        break;
      case 'best-selling':
      case 'best-seller':
        items.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
        break;
      case 'featured':
      default:
        items.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    const total = items.length;
    const page = Math.max(1, params?.page || 1);
    const limit = params?.limit || 12;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return {
      products: paginatedItems,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  public findProductById(id: string) {
    return this.data.products.find((p) => p.id === id || p.slug === id);
  }

  public createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>) {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.products[idx];
  }

  public deleteProduct(id: string) {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- CATEGORIES ---
  public getCategories() {
    return this.data.categories;
  }

  public findCategoryById(id: string) {
    return this.data.categories.find((c) => c.id === id || c.slug === id);
  }

  public createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) {
    const newCat: Category = {
      ...data,
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>) {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = {
      ...this.data.categories[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string) {
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter((c) => c.id !== id);
    if (this.data.categories.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- CARTS ---
  public getCart(userId?: string, sessionId?: string): Cart {
    let cart = this.data.carts.find(
      (c) => (userId && c.userId === userId) || (sessionId && c.sessionId === sessionId)
    );

    if (!cart) {
      cart = {
        id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        sessionId,
        items: [],
        updatedAt: new Date().toISOString(),
      };
      this.data.carts.push(cart);
      this.save();
    }

    // Populate product details in items
    const populatedItems = cart.items.map((item) => ({
      ...item,
      product: this.findProductById(item.productId),
    }));

    return {
      ...cart,
      items: populatedItems,
    };
  }

  public updateCartItems(cartId: string, items: Array<{ productId: string; variantId?: string; quantity: number; price: number }>, userId?: string) {
    let cart = this.data.carts.find((c) => c.id === cartId || (userId && c.userId === userId));
    if (!cart) {
      cart = {
        id: cartId || `cart_${Date.now()}`,
        userId,
        items: [],
        updatedAt: new Date().toISOString(),
      };
      this.data.carts.push(cart);
    }

    cart.items = items.map((it) => ({
      id: `ci_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId: it.productId,
      variantId: it.variantId,
      quantity: it.quantity,
      price: it.price,
    }));
    cart.updatedAt = new Date().toISOString();
    this.save();

    return this.getCart(userId, cart.sessionId);
  }

  public clearCart(cartId: string) {
    const cart = this.data.carts.find((c) => c.id === cartId);
    if (cart) {
      cart.items = [];
      cart.updatedAt = new Date().toISOString();
      this.save();
    }
  }

  // --- WISHLIST ---
  public getWishlist(key: string): Product[] {
    const ids = this.data.wishlists[key] || [];
    return ids.map((id) => this.findProductById(id)).filter((p): p is Product => !!p);
  }

  public toggleWishlist(key: string, productId: string) {
    if (!this.data.wishlists[key]) {
      this.data.wishlists[key] = [];
    }
    const list = this.data.wishlists[key];
    const idx = list.indexOf(productId);
    let added = false;
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(productId);
      added = true;
    }
    this.save();
    return { added, items: this.getWishlist(key) };
  }

  // --- ORDERS ---
  public getOrders(params?: { userId?: string; status?: string; search?: string; page?: number; limit?: number }) {
    let list = [...this.data.orders];

    if (params?.userId) {
      list = list.filter((o) => o.userId === params.userId);
    }

    if (params?.status && params.status !== 'all') {
      list = list.filter((o) => o.orderStatus === params.status);
    }

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const page = params?.page || 1;
    const limit = params?.limit || 15;
    const startIndex = (page - 1) * limit;

    return {
      orders: list.slice(startIndex, startIndex + limit),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  public findOrderById(id: string) {
    return this.data.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  public createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) {
    const orderNumber = `BG-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Deduct stock quantities from products and variants
    for (const item of newOrder.items) {
      const prod = this.findProductById(item.productId);
      if (prod) {
        prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
        if (prod.stockQuantity === 0) {
          prod.stockStatus = 'out_of_stock';
        } else if (prod.stockQuantity <= prod.lowStockThreshold) {
          prod.stockStatus = 'low_stock';
        }

        if (item.variantId && prod.variants) {
          const variant = prod.variants.find((v) => v.id === item.variantId);
          if (variant) {
            variant.stockQuantity = Math.max(0, variant.stockQuantity - item.quantity);
          }
        }
      }
    }

    // If coupon was used, increment usage count
    if (newOrder.couponCode) {
      const cpn = this.data.coupons.find((c) => c.code === newOrder.couponCode);
      if (cpn) {
        cpn.usageCount += 1;
      }
    }

    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  public updateOrderStatus(id: string, status: Order['orderStatus']) {
    const order = this.findOrderById(id);
    if (!order) return null;
    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  // --- COUPONS ---
  public getCoupons() {
    return this.data.coupons;
  }

  public findCouponByCode(code: string) {
    return this.data.coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
  }

  public createCoupon(data: Omit<Coupon, 'id' | 'usageCount' | 'createdAt'>) {
    const newCoupon: Coupon = {
      ...data,
      id: `cpn_${Date.now()}`,
      code: data.code.toUpperCase().trim(),
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.data.coupons.push(newCoupon);
    this.save();
    return newCoupon;
  }

  public updateCoupon(id: string, updates: Partial<Coupon>) {
    const idx = this.data.coupons.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.coupons[idx] = { ...this.data.coupons[idx], ...updates };
    this.save();
    return this.data.coupons[idx];
  }

  public deleteCoupon(id: string) {
    const initialLen = this.data.coupons.length;
    this.data.coupons = this.data.coupons.filter((c) => c.id !== id);
    if (this.data.coupons.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public validateCoupon(code: string, subtotal: number) {
    const coupon = this.findCouponByCode(code);
    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code.' };
    }
    if (coupon.status !== 'active') {
      return { valid: false, message: 'This coupon is no longer active.' };
    }
    if (new Date(coupon.expiryDate).getTime() < Date.now()) {
      return { valid: false, message: 'This coupon has expired.' };
    }
    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: 'This coupon has reached its usage limit.' };
    }
    if (subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order amount of $${coupon.minOrderAmount} required for this coupon.`,
      };
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && coupon.maxDiscount > 0) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = Math.min(coupon.value, subtotal);
    }

    return {
      valid: true,
      coupon,
      discount: Math.round(discount * 100) / 100,
      message: 'Coupon applied successfully!',
    };
  }

  // --- BANNERS ---
  public getBanners(type?: 'hero' | 'promo', onlyActive = true) {
    let items = [...this.data.banners];
    if (onlyActive) {
      items = items.filter((b) => b.status === 'active');
    }
    if (type) {
      items = items.filter((b) => b.type === type);
    }
    items.sort((a, b) => a.sortOrder - b.sortOrder);
    return items;
  }

  public createBanner(data: Omit<Banner, 'id'>) {
    const newBanner: Banner = {
      ...data,
      id: `ban_${Date.now()}`,
    };
    this.data.banners.push(newBanner);
    this.save();
    return newBanner;
  }

  public updateBanner(id: string, updates: Partial<Banner>) {
    const idx = this.data.banners.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.data.banners[idx] = { ...this.data.banners[idx], ...updates };
    this.save();
    return this.data.banners[idx];
  }

  public deleteBanner(id: string) {
    const initialLen = this.data.banners.length;
    this.data.banners = this.data.banners.filter((b) => b.id !== id);
    if (this.data.banners.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- REVIEWS ---
  public getReviews(params?: { productId?: string; status?: string }) {
    let list = [...this.data.reviews];
    if (params?.productId) {
      list = list.filter((r) => r.productId === params.productId);
    }
    if (params?.status && params.status !== 'all') {
      list = list.filter((r) => r.status === params.status);
    } else if (!params?.status && params?.productId) {
      // For public product view, default to approved only
      list = list.filter((r) => r.status === 'approved');
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }

  public createReview(data: Omit<Review, 'id' | 'createdAt' | 'status'>) {
    const newRev: Review = {
      ...data,
      id: `rev_${Date.now()}`,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };
    this.data.reviews.push(newRev);

    // Update product rating
    const prod = this.findProductById(data.productId);
    if (prod) {
      const prodRevs = this.data.reviews.filter(
        (r) => r.productId === data.productId && r.status === 'approved'
      );
      const totalScore = prodRevs.reduce((acc, r) => acc + r.rating, 0);
      prod.rating = Math.round((totalScore / prodRevs.length) * 10) / 10;
      prod.reviewCount = prodRevs.length;
    }

    this.save();
    return newRev;
  }

  public updateReviewStatus(id: string, status: Review['status']) {
    const rev = this.data.reviews.find((r) => r.id === id);
    if (!rev) return null;
    rev.status = status;
    this.save();
    return rev;
  }

  public deleteReview(id: string) {
    const initialLen = this.data.reviews.length;
    this.data.reviews = this.data.reviews.filter((r) => r.id !== id);
    if (this.data.reviews.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- CUSTOMERS ---
  public getCustomers(params?: { search?: string; status?: string }) {
    let customers = this.data.users.filter((u) => u.role === 'customer');

    if (params?.status && params.status !== 'all') {
      customers = customers.filter((c) => c.status === params.status);
    }

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      customers = customers.filter(
        (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
      );
    }

    return customers.map((c) => {
      const userOrders = this.data.orders.filter((o) => o.userId === c.id);
      const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        orderCount: userOrders.length,
        totalSpent: Math.round(totalSpent * 100) / 100,
        status: c.status,
        createdAt: c.createdAt,
      };
    });
  }

  // --- INVENTORY ---
  public getInventory(params?: { search?: string; lowStockOnly?: boolean }) {
    let items = [...this.data.products];
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      items = items.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    if (params?.lowStockOnly) {
      items = items.filter((p) => p.stockQuantity <= p.lowStockThreshold);
    }
    return items.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      currentStock: p.stockQuantity,
      lowStockThreshold: p.lowStockThreshold,
      stockStatus: p.stockStatus,
      variants: p.variants || [],
      price: p.salePrice ?? p.regularPrice,
    }));
  }

  public updateStock(productId: string, newStock: number, lowStockThreshold?: number) {
    const prod = this.findProductById(productId);
    if (!prod) return null;
    prod.stockQuantity = Math.max(0, newStock);
    if (lowStockThreshold !== undefined) {
      prod.lowStockThreshold = lowStockThreshold;
    }
    if (prod.stockQuantity === 0) {
      prod.stockStatus = 'out_of_stock';
    } else if (prod.stockQuantity <= prod.lowStockThreshold) {
      prod.stockStatus = 'low_stock';
    } else {
      prod.stockStatus = 'in_stock';
    }
    this.save();
    return prod;
  }

  // --- STORE SETTINGS ---
  public getStoreSettings(): StoreSettings {
    return this.data.storeSettings;
  }

  public updateStoreSettings(updates: Partial<StoreSettings>): StoreSettings {
    this.data.storeSettings = {
      ...this.data.storeSettings,
      ...updates,
    };
    this.save();
    return this.data.storeSettings;
  }

  // --- ADMIN DASHBOARD & REPORTS (REAL DATA CALCULATION) ---
  public getDashboardStats() {
    const orders = this.data.orders;
    const products = this.data.products;
    const customers = this.data.users.filter((u) => u.role === 'customer');

    const totalSales = orders.reduce((acc, o) => (o.orderStatus !== 'Cancelled' ? acc + o.total : acc), 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending').length;
    const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered').length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === 'Cancelled').length;
    const lowStockProducts = products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length;

    // Sales over time (group by date)
    const salesByDate: Record<string, { date: string; sales: number; orders: number }> = {};
    for (const o of orders) {
      const dateKey = o.createdAt.split('T')[0];
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = { date: dateKey, sales: 0, orders: 0 };
      }
      salesByDate[dateKey].orders += 1;
      if (o.orderStatus !== 'Cancelled') {
        salesByDate[dateKey].sales += o.total;
      }
    }
    const salesChart = Object.values(salesByDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .map((item) => ({
        ...item,
        sales: Math.round(item.sales * 100) / 100,
      }));

    // Top selling products based on order items
    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const o of orders) {
      if (o.orderStatus === 'Cancelled') continue;
      for (const it of o.items) {
        if (!productSalesMap[it.productId]) {
          productSalesMap[it.productId] = { name: it.productName, quantity: 0, revenue: 0 };
        }
        productSalesMap[it.productId].quantity += it.quantity;
        productSalesMap[it.productId].revenue += it.subtotal;
      }
    }
    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map((p) => ({ ...p, revenue: Math.round(p.revenue * 100) / 100 }));

    // Sales by Category
    const categorySalesMap: Record<string, number> = {};
    for (const o of orders) {
      if (o.orderStatus === 'Cancelled') continue;
      for (const it of o.items) {
        const prod = this.findProductById(it.productId);
        const cat = prod ? this.findCategoryById(prod.categoryId) : null;
        const catName = cat ? cat.name : 'Other';
        categorySalesMap[catName] = (categorySalesMap[catName] || 0) + it.subtotal;
      }
    }
    const salesByCategory = Object.entries(categorySalesMap).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }));

    return {
      totalSales: Math.round(totalSales * 100) / 100,
      totalOrders,
      totalCustomers: customers.length,
      totalProducts: products.length,
      lowStockProducts,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      recentOrders: orders.slice(0, 6),
      salesChart,
      topSellingProducts,
      salesByCategory,
    };
  }

  public getReports(range: 'today' | '7days' | '30days' | 'year' | 'all' = '30days') {
    const now = new Date();
    let cutoff = new Date();
    if (range === 'today') cutoff.setHours(0, 0, 0, 0);
    else if (range === '7days') cutoff.setDate(now.getDate() - 7);
    else if (range === '30days') cutoff.setDate(now.getDate() - 30);
    else if (range === 'year') cutoff.setFullYear(now.getFullYear() - 1);
    else cutoff = new Date(0);

    const filteredOrders = this.data.orders.filter(
      (o) => new Date(o.createdAt).getTime() >= cutoff.getTime()
    );

    const validOrders = filteredOrders.filter((o) => o.orderStatus !== 'Cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrdersCount = filteredOrders.length;
    const aov = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

    // Best-selling products in range
    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const o of validOrders) {
      for (const it of o.items) {
        if (!productSalesMap[it.productId]) {
          productSalesMap[it.productId] = { name: it.productName, quantity: 0, revenue: 0 };
        }
        productSalesMap[it.productId].quantity += it.quantity;
        productSalesMap[it.productId].revenue += it.subtotal;
      }
    }
    const bestSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
      .map((p) => ({ ...p, revenue: Math.round(p.revenue * 100) / 100 }));

    // Best-performing categories in range
    const catRevenueMap: Record<string, number> = {};
    for (const o of validOrders) {
      for (const it of o.items) {
        const prod = this.findProductById(it.productId);
        const cat = prod ? this.findCategoryById(prod.categoryId) : null;
        const name = cat ? cat.name : 'Other';
        catRevenueMap[name] = (catRevenueMap[name] || 0) + it.subtotal;
      }
    }
    const bestCategories = Object.entries(catRevenueMap)
      .map(([name, revenue]) => ({ name, revenue: Math.round(revenue * 100) / 100 }))
      .sort((a, b) => b.revenue - a.revenue);

    // Customer growth
    const newCustomersInRange = this.data.users.filter(
      (u) => u.role === 'customer' && new Date(u.createdAt).getTime() >= cutoff.getTime()
    ).length;

    return {
      range,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: totalOrdersCount,
      averageOrderValue: Math.round(aov * 100) / 100,
      bestSellingProducts,
      bestCategories,
      customerGrowth: newCustomersInRange,
    };
  }
}

export const db = new Database();
