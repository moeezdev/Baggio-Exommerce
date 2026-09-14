import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// Get wishlist
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response): any => {
  const key = req.user?.userId || (req.query.guestId as string) || 'guest_wishlist';
  const products = db.getWishlist(key);
  return res.json(products);
});

// Toggle wishlist item
router.post('/toggle', optionalAuth, (req: AuthenticatedRequest, res: Response): any => {
  const { productId, guestId } = req.body;
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required.' });
  }

  const key = req.user?.userId || guestId || 'guest_wishlist';
  const result = db.toggleWishlist(key, productId);
  return res.json(result);
});

export default router;
