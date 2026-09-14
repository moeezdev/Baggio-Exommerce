import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// Public: Get all categories
router.get('/', (_req, res): any => {
  const categories = db.getCategories();
  return res.json(categories);
});

// Public: Get category by id or slug
router.get('/:id', (req, res): any => {
  const category = db.findCategoryById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found.' });
  }

  // Also get products count
  const productsResult = db.getProducts({ categoryId: category.id, limit: 100 });

  return res.json({
    category,
    productsCount: productsResult.total,
  });
});

// Admin: Create category
router.post('/', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  try {
    const { name, slug, description, image, status, parentId } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newCategory = db.createCategory({
      name,
      slug: generatedSlug,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop',
      status: status || 'active',
      parentId: parentId || null,
    });

    return res.status(201).json({
      category: newCategory,
      message: 'Category created successfully.',
    });
  } catch (err: any) {
    console.error('Create category error:', err);
    return res.status(500).json({ message: 'Failed to create category.' });
  }
});

// Admin: Update category
router.put('/:id', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  const existing = db.findCategoryById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: 'Category not found.' });
  }

  const updated = db.updateCategory(existing.id, req.body);
  return res.json({
    category: updated,
    message: 'Category updated successfully.',
  });
});

// Admin: Delete category
router.delete('/:id', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  const existing = db.findCategoryById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: 'Category not found.' });
  }

  const success = db.deleteCategory(existing.id);
  if (success) {
    return res.json({ message: 'Category deleted successfully.' });
  }
  return res.status(500).json({ message: 'Failed to delete category.' });
});

export default router;
