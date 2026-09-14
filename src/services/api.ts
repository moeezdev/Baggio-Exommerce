const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}, isAdmin = false): Promise<T> {
  const token = isAdmin
    ? localStorage.getItem('baggio_admin_token')
    : localStorage.getItem('baggio_customer_token');

  const guestSessionId = localStorage.getItem('baggio_guest_session_id') || `guest_${Date.now()}`;
  if (!localStorage.getItem('baggio_guest_session_id')) {
    localStorage.setItem('baggio_guest_session_id', guestSessionId);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-session-id': guestSessionId,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is FormData, delete Content-Type to let browser set boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = (isJson && data?.message) || response.statusText || 'An unexpected error occurred';
    throw new ApiError(errorMsg, response.status, data);
  }

  return data as T;
}

export const api = {
  // Authentication
  customerRegister: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  customerLogin: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  customerMe: () => request<any>('/auth/me'),
  customerUpdateProfile: (body: any) => request<any>('/auth/update-profile', { method: 'PUT', body: JSON.stringify(body) }),
  customerChangePassword: (body: any) => request<any>('/auth/change-password', { method: 'PUT', body: JSON.stringify(body) }),
  forgotPassword: (body: any) => request<any>('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body: any) => request<any>('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),

  // Admin Auth & Dash
  adminLogin: (body: any) => request<any>('/admin/login', { method: 'POST', body: JSON.stringify(body) }, true),
  adminMe: () => request<any>('/admin/me', {}, true),
  adminDashboard: () => request<any>('/admin/dashboard', {}, true),
  adminReports: (range = '30days') => request<any>(`/admin/reports?range=${range}`, {}, true),

  // Products
  getProducts: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return request<any>(`/products?${query.toString()}`);
  },
  getProductById: (id: string) => request<any>(`/products/${id}`),
  adminCreateProduct: (body: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(body) }, true),
  adminUpdateProduct: (id: string, body: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }, true),
  adminDeleteProduct: (id: string) => request<any>(`/products/${id}`, { method: 'DELETE' }, true),

  // Categories
  getCategories: () => request<any>('/categories'),
  getCategoryById: (id: string) => request<any>(`/categories/${id}`),
  adminCreateCategory: (body: any) => request<any>('/categories', { method: 'POST', body: JSON.stringify(body) }, true),
  adminUpdateCategory: (id: string, body: any) => request<any>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }, true),
  adminDeleteCategory: (id: string) => request<any>(`/categories/${id}`, { method: 'DELETE' }, true),

  // Cart
  getCart: () => request<any>('/cart'),
  addToCart: (body: { productId: string; variantId?: string; quantity: number; price?: number }) =>
    request<any>('/cart/items', { method: 'POST', body: JSON.stringify(body) }),
  updateCartItem: (id: string, quantity: number) =>
    request<any>(`/cart/items/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeFromCart: (id: string) => request<any>(`/cart/items/${id}`, { method: 'DELETE' }),
  clearCart: () => request<any>('/cart/clear', { method: 'DELETE' }),
  syncCart: (cartId: string, items: any[]) =>
    request<any>('/cart/sync', { method: 'POST', body: JSON.stringify({ cartId, items }) }),

  // Orders
  getOrders: (params: Record<string, any> = {}, isAdmin = false) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return request<any>(`/orders?${query.toString()}`, {}, isAdmin);
  },
  getOrderById: (id: string, isAdmin = false) => request<any>(`/orders/${id}`, {}, isAdmin),
  createOrder: (body: any) => request<any>('/orders', { method: 'POST', body: JSON.stringify(body) }),
  adminUpdateOrderStatus: (id: string, status: string) =>
    request<any>(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }, true),
  cancelOrder: (id: string) => request<any>(`/orders/${id}/cancel`, { method: 'PUT' }),

  // Wishlist
  getWishlist: () => request<any>('/wishlist'),
  toggleWishlist: (productId: string) =>
    request<any>('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ productId }) }),

  // Reviews
  getReviews: (params: { productId?: string; status?: string } = {}, isAdmin = false) => {
    const query = new URLSearchParams();
    if (params.productId) query.append('productId', params.productId);
    if (params.status) query.append('status', params.status);
    return request<any>(`/reviews?${query.toString()}`, {}, isAdmin);
  },
  submitReview: (body: { productId: string; rating: number; comment: string }) =>
    request<any>('/reviews', { method: 'POST', body: JSON.stringify(body) }),
  adminUpdateReviewStatus: (id: string, status: string) =>
    request<any>(`/reviews/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }, true),
  adminDeleteReview: (id: string) => request<any>(`/reviews/${id}`, { method: 'DELETE' }, true),

  // Coupons
  validateCoupon: (code: string, subtotal: number) =>
    request<any>('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, subtotal }) }),
  adminGetCoupons: () => request<any>('/coupons', {}, true),
  adminCreateCoupon: (body: any) => request<any>('/coupons', { method: 'POST', body: JSON.stringify(body) }, true),
  adminUpdateCoupon: (id: string, body: any) => request<any>(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(body) }, true),
  adminDeleteCoupon: (id: string) => request<any>(`/coupons/${id}`, { method: 'DELETE' }, true),

  // Banners
  getBanners: (type?: 'hero' | 'promo') => request<any>(`/banners${type ? `?type=${type}` : ''}`),
  adminGetBanners: () => request<any>('/banners/admin', {}, true),
  adminCreateBanner: (body: any) => request<any>('/banners', { method: 'POST', body: JSON.stringify(body) }, true),
  adminUpdateBanner: (id: string, body: any) => request<any>(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(body) }, true),
  adminDeleteBanner: (id: string) => request<any>(`/banners/${id}`, { method: 'DELETE' }, true),

  // Customers
  adminGetCustomers: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val) query.append(key, String(val));
    });
    return request<any>(`/customers?${query.toString()}`, {}, true);
  },
  adminGetCustomerById: (id: string) => request<any>(`/customers/${id}`, {}, true),
  adminUpdateCustomerStatus: (id: string, status: string) =>
    request<any>(`/customers/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }, true),
  adminToggleCustomerStatus: async (id: string) => {
    const cust = await request<any>(`/customers/${id}`, {}, true);
    const newStatus = cust.customer.status === 'Active' || cust.customer.status === 'active' ? 'Disabled' : 'Active';
    return request<any>(`/customers/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) }, true);
  },

  // Inventory
  adminGetInventory: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) query.append(key, String(val));
    });
    return request<any>(`/inventory?${query.toString()}`, {}, true);
  },
  adminUpdateStock: (productId: string, currentStock: number | { stockQuantity?: number; lowStockThreshold?: number }, lowStockThreshold?: number) => {
    let stock = typeof currentStock === 'number' ? currentStock : currentStock.stockQuantity;
    let threshold = typeof currentStock === 'object' ? currentStock.lowStockThreshold : lowStockThreshold;
    return request<any>(`/inventory/${productId}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ currentStock: stock, lowStockThreshold: threshold }),
    }, true);
  },

  // Settings
  getSettings: () => request<any>('/settings'),
  getStoreSettings: () => request<any>('/settings'),
  adminUpdateSettings: (body: any) => request<any>('/settings', { method: 'PUT', body: JSON.stringify(body) }, true),

  // Image Upload
  adminUploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return request<any>('/upload/single', { method: 'POST', body: formData }, true);
  },
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return request<any>('/upload/single', { method: 'POST', body: formData }, true);
  },

  // Convenience Aliases for Admin
  adminGetOrders: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return request<any>(`/orders?${query.toString()}`, {}, true);
  },
  adminGetProducts: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return request<any>(`/products?${query.toString()}`, {}, true);
  },
  adminGetReviews: (params: { productId?: string; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.productId) query.append('productId', params.productId);
    if (params.status) query.append('status', params.status);
    return request<any>(`/reviews?${query.toString()}`, {}, true);
  },
  adminSeedSampleCatalog: () => {
    return request<{ message: string }>('/admin/seed-sample-catalog', { method: 'POST' }, true);
  },
  adminClearAllData: () => {
    return request<{ message: string }>('/admin/clear-all-data', { method: 'POST' }, true);
  },
};
