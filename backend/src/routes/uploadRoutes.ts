import { Router, Response } from 'express';
import { uploadMiddleware, storageService } from '../services/storageService.ts';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// Admin: Upload single image
router.post('/single', authenticateAdmin, uploadMiddleware.single('image'), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }

    const fileUrl = await storageService.uploadFile(req.file);
    return res.json({
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      message: 'Image uploaded successfully.',
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return res.status(500).json({ message: err.message || 'File upload failed.' });
  }
});

// Admin: Upload multiple images
router.post('/multiple', authenticateAdmin, uploadMiddleware.array('images', 8), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No images provided.' });
    }

    const uploadedUrls = await Promise.all(files.map((file) => storageService.uploadFile(file)));
    return res.json({
      urls: uploadedUrls,
      count: uploadedUrls.length,
      message: 'Images uploaded successfully.',
    });
  } catch (err: any) {
    console.error('Multiple upload error:', err);
    return res.status(500).json({ message: err.message || 'Files upload failed.' });
  }
});

export default router;
