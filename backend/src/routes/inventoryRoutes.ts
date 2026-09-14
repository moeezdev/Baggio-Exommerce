import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// Admin: Get inventory overview
router.get('/', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  const { search, lowStockOnly } = req.query;
  const inventory = db.getInventory({
    search: search as string,
    lowStockOnly: lowStockOnly === 'true',
  });
  return res.json(inventory);
});

// Admin: Update product stock
router.put('/:id/stock', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  const { currentStock, lowStockThreshold } = req.body;
  if (currentStock === undefined) {
    return res.status(400).json({ message: 'Current stock number is required.' });
  }

  const updated = db.updateStock(
    req.params.id,
    Number(currentStock),
    lowStockThreshold !== undefined ? Number(lowStockThreshold) : undefined
  );

  if (!updated) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  return res.json({
    product: updated,
    message: 'Stock updated successfully.',
  });
});

export default router;
