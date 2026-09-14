import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// Public: Get active banners for homepage (hero & promo)
router.get('/', (req, res): any => {
  const type = req.query.type as 'hero' | 'promo' | undefined;
  const banners = db.getBanners(type, true);
  return res.json(banners);
});

// Admin: Get all banners (including inactive)
router.get('/admin', authenticateAdmin, (_req: AuthenticatedRequest, res: Response): any => {
  const banners = db.getBanners(undefined, false);
  return res.json(banners);
});

// Admin: Create banner
router.post('/', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  const { title, description, image, buttonText, buttonUrl, type, status, sortOrder } = req.body;
  if (!title || !image) {
    return res.status(400).json({ message: 'Banner title and image URL are required.' });
  }

  const newBanner = db.createBanner({
    title,
    description: description || '',
    image,
    buttonText: buttonText || 'Shop Now',
    buttonUrl: buttonUrl || '/shop',
    type: type || 'hero',
    status: status || 'active',
    sortOrder: Number(sortOrder) || 1,
  });

  return res.status(201).json({
    banner: newBanner,
    message: 'Banner created successfully.',
  });
});

// Admin: Update banner
router.put('/:id', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  const updated = db.updateBanner(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ message: 'Banner not found.' });
  }
  return res.json({
    banner: updated,
    message: 'Banner updated successfully.',
  });
});

// Admin: Delete banner
router.delete('/:id', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  const deleted = db.deleteBanner(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'Banner not found.' });
  }
  return res.json({ message: 'Banner deleted successfully.' });
});

export default router;
