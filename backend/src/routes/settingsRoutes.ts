import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// Public: Get store settings (store name, currency, shipping thresholds, etc.)
router.get('/', (_req, res): any => {
  const settings = db.getStoreSettings();
  return res.json(settings);
});

// Admin: Update store settings
router.put('/', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  try {
    const updates = req.body;
    if (updates.shippingFee !== undefined) updates.shippingFee = Number(updates.shippingFee);
    if (updates.freeShippingThreshold !== undefined)
      updates.freeShippingThreshold = Number(updates.freeShippingThreshold);
    if (updates.taxPercentage !== undefined) updates.taxPercentage = Number(updates.taxPercentage);

    const updatedSettings = db.updateStoreSettings(updates);
    return res.json({
      settings: updatedSettings,
      message: 'Store settings updated successfully.',
    });
  } catch (err: any) {
    console.error('Settings error:', err);
    return res.status(500).json({ message: 'Failed to update store settings.' });
  }
});

export default router;
