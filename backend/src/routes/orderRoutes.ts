import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import {
  optionalAuth,
  authenticateCustomer,
  authenticateAdmin,
  AuthenticatedRequest,
} from '../middleware/auth.ts';

const router = Router();

// Get orders:
// - If admin, returns all orders with status/search/pagination
// - If customer, returns customer's orders
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response): any => {
  const { status, search, page, limit } = req.query;

  // If user is logged in as customer and NOT admin
  if (req.user && req.user.role === 'customer') {
    const result = db.getOrders({
      userId: req.user.userId,
      status: status as string,
      search: search as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    });
    return res.json(result);
  }

  // If admin
  if (req.user && req.user.role === 'admin') {
    const result = db.getOrders({
      status: status as string,
      search: search as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 15,
    });
    return res.json(result);
  }

  return res.status(401).json({ message: 'Authentication required to view orders.' });
});

// Get single order by ID or order number
router.get('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response): any => {
  const order = db.findOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  // Security check: if customer is logged in, ensure it is their order
  if (req.user && req.user.role === 'customer' && order.userId && order.userId !== req.user.userId) {
    return res.status(403).json({ message: 'Access forbidden: You cannot view this order.' });
  }

  return res.json(order);
});

// Create Order (Checkout)
router.post('/', optionalAuth, (req: AuthenticatedRequest, res: Response): any => {
  try {
    const {
      customerName,
      email,
      phone,
      shippingAddress,
      paymentMethod,
      items,
      couponCode,
      notes,
    } = req.body;

    if (!customerName || !email || !shippingAddress || !items || !items.length) {
      return res.status(400).json({ message: 'Customer details, shipping address, and order items are required.' });
    }

    // Verify product prices and calculate totals from real product database
    const settings = db.getStoreSettings();
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = db.findProductById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} is no longer available.` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Only ${product.stockQuantity} available.`,
        });
      }

      let unitPrice = product.salePrice ?? product.regularPrice;
      let variantName = '';

      if (item.variantId && product.variants) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (variant) {
          unitPrice = variant.price;
          variantName = variant.name;
          if (variant.stockQuantity < item.quantity) {
            return res.status(400).json({
              message: `Insufficient stock for variant "${variant.name}". Only ${variant.stockQuantity} available.`,
            });
          }
        }
      }

      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || '';

      validatedItems.push({
        id: `oi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        variantId: item.variantId,
        productName: product.name,
        productImage: primaryImage,
        variantName,
        quantity: item.quantity,
        price: unitPrice,
        subtotal: itemSubtotal,
      });
    }

    // Handle coupon validation
    let discount = 0;
    if (couponCode) {
      const couponCheck = db.validateCoupon(couponCode, subtotal);
      if (couponCheck.valid && couponCheck.discount) {
        discount = couponCheck.discount;
      }
    }

    // Shipping fee
    const shippingFee =
      subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;

    // Tax calculation
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round((taxableAmount * (settings.taxPercentage / 100)) * 100) / 100;
    const total = Math.round((taxableAmount + shippingFee + tax) * 100) / 100;

    const newOrder = db.createOrder({
      userId: req.user?.userId,
      customerName,
      email: email.toLowerCase().trim(),
      phone: phone || '',
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: 'pending',
      orderStatus: 'Pending',
      subtotal: Math.round(subtotal * 100) / 100,
      shippingFee,
      discount,
      tax,
      total,
      couponCode,
      items: validatedItems,
      notes,
    });

    return res.status(201).json({
      order: newOrder,
      message: 'Order placed successfully.',
    });
  } catch (err: any) {
    console.error('Create order error:', err);
    return res.status(500).json({ message: 'Failed to place order.' });
  }
});

// Admin: Update order status
router.put('/:id/status', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const updatedOrder = db.updateOrderStatus(req.params.id, status);
  if (!updatedOrder) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  return res.json({
    order: updatedOrder,
    message: `Order status updated to ${status}.`,
  });
});

// Customer or Admin: Cancel Order
router.put('/:id/cancel', optionalAuth, (req: AuthenticatedRequest, res: Response): any => {
  const order = db.findOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  // If customer, verify permission and order state
  if (req.user && req.user.role === 'customer') {
    if (order.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (order.orderStatus !== 'Pending' && order.orderStatus !== 'Confirmed') {
      return res.status(400).json({
        message: `Order cannot be cancelled because it is already ${order.orderStatus.toLowerCase()}.`,
      });
    }
  }

  const updatedOrder = db.updateOrderStatus(order.id, 'Cancelled');
  return res.json({
    order: updatedOrder,
    message: 'Order has been cancelled.',
  });
});

export default router;
