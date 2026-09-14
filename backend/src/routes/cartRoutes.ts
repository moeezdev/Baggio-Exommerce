import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// Get cart
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response): any => {
  const userId = req.user?.userId;
  const sessionId = (req.query.sessionId as string) || req.headers['x-session-id'] as string;
  const cart = db.getCart(userId, sessionId);
  return res.json(cart);
});

// Update entire cart items or sync from local storage
router.post('/sync', optionalAuth, (req: AuthenticatedRequest, res: Response): any => {
  const userId = req.user?.userId;
  const { cartId, items } = req.body;
  const updatedCart = db.updateCartItems(cartId, items || [], userId);
  return res.json(updatedCart);
});

// Add item to cart
router.post('/items', optionalAuth, (req: AuthenticatedRequest, res: Response): any => {
  const userId = req.user?.userId;
  const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string);
  const { productId, variantId, quantity, price } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ message: 'Product ID and quantity are required.' });
  }

  const product = db.findProductById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  if (product.stockQuantity <= 0) {
    return res.status(400).json({ message: `"${product.name}" is currently out of stock.` });
  }

  if (variantId && product.variants) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant && variant.stockQuantity <= 0) {
      return res.status(400).json({ message: `Selected option (${variant.name || variant.size}) is out of stock.` });
    }
  }

  const cart = db.getCart(userId, sessionId);
  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId === productId && item.variantId === variantId
  );

  const effectivePrice = price || (product.salePrice ?? product.regularPrice);
  const requestedQty = Number(quantity);

  if (existingItemIndex > -1) {
    const newQty = cart.items[existingItemIndex].quantity + requestedQty;
    if (newQty > product.stockQuantity) {
      return res.status(400).json({
        message: `Cannot add more than available stock (${product.stockQuantity} items in inventory).`,
      });
    }
    cart.items[existingItemIndex].quantity = newQty;
  } else {
    if (requestedQty > product.stockQuantity) {
      return res.status(400).json({
        message: `Only ${product.stockQuantity} items in stock.`,
      });
    }
    cart.items.push({
      id: `ci_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId,
      variantId,
      quantity: requestedQty,
      price: effectivePrice,
    });
  }

  const updatedCart = db.updateCartItems(cart.id, cart.items, userId);
  return res.json(updatedCart);
});

// Update item quantity
router.put('/items/:id', optionalAuth, (req: AuthenticatedRequest, res: Response): any => {
  const userId = req.user?.userId;
  const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string);
  const { quantity } = req.body;
  const itemId = req.params.id;

  const cart = db.getCart(userId, sessionId);
  const existingItem = cart.items.find((item) => item.id === itemId);

  if (!existingItem) {
    return res.status(404).json({ message: 'Cart item not found.' });
  }

  if (Number(quantity) <= 0) {
    cart.items = cart.items.filter((item) => item.id !== itemId);
  } else {
    existingItem.quantity = Number(quantity);
  }

  const updatedCart = db.updateCartItems(cart.id, cart.items, userId);
  return res.json(updatedCart);
});

// Remove item from cart
router.delete('/items/:id', optionalAuth, (req: AuthenticatedRequest, res: Response): any => {
  const userId = req.user?.userId;
  const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string);
  const itemId = req.params.id;

  const cart = db.getCart(userId, sessionId);
  cart.items = cart.items.filter((item) => item.id !== itemId);

  const updatedCart = db.updateCartItems(cart.id, cart.items, userId);
  return res.json(updatedCart);
});

// Clear cart
router.delete('/clear', optionalAuth, (req: AuthenticatedRequest, res: Response): any => {
  const userId = req.user?.userId;
  const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string);
  const cart = db.getCart(userId, sessionId);
  db.clearCart(cart.id);
  return res.json({ message: 'Cart cleared successfully.' });
});

export default router;
