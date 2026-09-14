import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// Public: Validate coupon
router.post('/validate', (req, res): any => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ valid: false, message: 'Coupon code is required.' });
  }

  const result = db.validateCoupon(code, Number(subtotal) || 0);
  if (!result.valid) {
    return res.status(400).json(result);
  }
  return res.json(result);
});

// Admin: Get all coupons
router.get('/', authenticateAdmin, (_req: AuthenticatedRequest, res: Response): any => {
  const coupons = db.getCoupons();
  return res.json(coupons);
});

// Admin: Create coupon
router.post('/', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  try {
    const {
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      startDate,
      expiryDate,
      usageLimit,
      status,
    } = req.body;

    if (!code || !type || value === undefined || !expiryDate) {
      return res.status(400).json({ message: 'Code, type, value, and expiry date are required.' });
    }

    const existing = db.findCouponByCode(code);
    if (existing) {
      return res.status(400).json({ message: 'A coupon with this code already exists.' });
    }

    const newCoupon = db.createCoupon({
      code,
      type,
      value: Number(value),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      startDate: startDate || new Date().toISOString(),
      expiryDate,
      usageLimit: Number(usageLimit) || 0,
      status: status || 'active',
    });

    return res.status(201).json({
      coupon: newCoupon,
      message: 'Coupon created successfully.',
    });
  } catch (err: any) {
    console.error('Create coupon error:', err);
    return res.status(500).json({ message: 'Failed to create coupon.' });
  }
});

// Admin: Update coupon
router.put('/:id', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  const updated = db.updateCoupon(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ message: 'Coupon not found.' });
  }
  return res.json({
    coupon: updated,
    message: 'Coupon updated successfully.',
  });
});

// Admin: Delete coupon
router.delete('/:id', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  const deleted = db.deleteCoupon(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'Coupon not found.' });
  }
  return res.json({ message: 'Coupon deleted successfully.' });
});

export default router;
