import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import {
  optionalAuth,
  authenticateCustomer,
  authenticateAdmin,
  AuthenticatedRequest,
} from '../middleware/auth.ts';

const router = Router();

// Public: Get reviews for a product (or admin get all)
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response): any => {
  const { productId, status } = req.query;

  // If admin, can view all with status filter
  if (req.user?.role === 'admin') {
    const list = db.getReviews({
      productId: productId as string,
      status: status as string,
    });
    return res.json(list);
  }

  // Public/Customer view: only approved reviews for that product
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required.' });
  }

  const list = db.getReviews({
    productId: productId as string,
    status: 'approved',
  });
  return res.json(list);
});

// Customer or Logged in user: Submit review
router.post('/', authenticateCustomer, (req: AuthenticatedRequest, res: Response): any => {
  const { productId, rating, comment } = req.body;
  if (!productId || !rating || !comment) {
    return res.status(400).json({ message: 'Product ID, rating (1-5), and comment are required.' });
  }

  const user = db.findUserById(req.user!.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const product = db.findProductById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const review = db.createReview({
    productId,
    userId: user.id,
    userName: user.name,
    rating: Math.min(5, Math.max(1, Number(rating))),
    comment: comment.trim(),
  });

  return res.status(201).json({
    review,
    message: 'Thank you for your review! It has been posted successfully.',
  });
});

// Admin: Update review status (approve/hide)
router.put('/:id/status', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  const { status } = req.body;
  if (!['approved', 'hidden', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Status must be approved, hidden, or pending.' });
  }

  const updated = db.updateReviewStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ message: 'Review not found.' });
  }

  return res.json({
    review: updated,
    message: `Review marked as ${status}.`,
  });
});

// Admin: Delete review
router.delete('/:id', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  const deleted = db.deleteReview(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'Review not found.' });
  }
  return res.json({ message: 'Review deleted successfully.' });
});

export default router;
