import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// Public: Get products with filters, sorting, search, pagination
router.get('/', (req, res): any => {
  try {
    const {
      search,
      categoryId,
      categorySlug,
      minPrice,
      maxPrice,
      brand,
      status,
      sort,
      featured,
      isNew,
      bestSeller,
      page,
      limit,
    } = req.query;

    const result = db.getProducts({
      search: search as string,
      categoryId: categoryId as string,
      categorySlug: categorySlug as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      brand: brand as string,
      status: status as string,
      sort: sort as string,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
      isNew: isNew === 'true' ? true : isNew === 'false' ? false : undefined,
      bestSeller: bestSeller === 'true' ? true : bestSeller === 'false' ? false : undefined,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 12,
    });

    return res.json(result);
  } catch (err: any) {
    console.error('Fetch products error:', err);
    return res.status(500).json({ message: 'Failed to load products.' });
  }
});

// Public: Get single product by id or slug
router.get('/:id', (req, res): any => {
  const product = db.findProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  // Also include category details & related products
  const category = db.findCategoryById(product.categoryId);
  const relatedResult = db.getProducts({
    categoryId: product.categoryId,
    limit: 4,
  });
  const relatedProducts = relatedResult.products.filter((p) => p.id !== product.id).slice(0, 4);

  return res.json({
    product,
    category,
    relatedProducts,
  });
});

// Admin: Create new product
router.post('/', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  try {
    const {
      name,
      slug,
      sku,
      description,
      shortDescription,
      categoryId,
      brand,
      regularPrice,
      salePrice,
      costPrice,
      tax,
      discount,
      stockQuantity,
      lowStockThreshold,
      images,
      variants,
      weight,
      length,
      width,
      height,
      seoTitle,
      seoDescription,
      status,
      featured,
      isNew,
      bestSeller,
    } = req.body;

    if (!name || !sku || !regularPrice || !categoryId) {
      return res.status(400).json({ message: 'Product name, SKU, price, and category are required.' });
    }

    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const stock = Number(stockQuantity) || 0;
    const lowStock = Number(lowStockThreshold) || 5;
    let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
    if (stock === 0) stockStatus = 'out_of_stock';
    else if (stock <= lowStock) stockStatus = 'low_stock';

    const newProduct = db.createProduct({
      name,
      slug: generatedSlug,
      sku,
      description: description || '',
      shortDescription: shortDescription || '',
      categoryId,
      brand: brand || 'Baggio',
      regularPrice: Number(regularPrice),
      salePrice: salePrice ? Number(salePrice) : null,
      costPrice: costPrice ? Number(costPrice) : 0,
      tax: tax ? Number(tax) : 0,
      discount: discount ? Number(discount) : 0,
      stockQuantity: stock,
      lowStockThreshold: lowStock,
      stockStatus,
      images: images || [],
      variants: variants || [],
      weight: weight ? Number(weight) : undefined,
      length: length ? Number(length) : undefined,
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || shortDescription || '',
      status: status || 'active',
      featured: !!featured,
      isNew: isNew !== undefined ? !!isNew : true,
      bestSeller: !!bestSeller,
      rating: 5.0,
      reviewCount: 0,
    });

    return res.status(201).json({
      product: newProduct,
      message: 'Product created successfully.',
    });
  } catch (err: any) {
    console.error('Create product error:', err);
    return res.status(500).json({ message: 'Failed to create product.' });
  }
});

// Admin: Update existing product
router.put('/:id', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  try {
    const existing = db.findProductById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const updates = { ...req.body };
    if (updates.regularPrice !== undefined) updates.regularPrice = Number(updates.regularPrice);
    if (updates.salePrice !== undefined && updates.salePrice !== null) {
      updates.salePrice = updates.salePrice === '' ? null : Number(updates.salePrice);
    }
    if (updates.stockQuantity !== undefined) {
      updates.stockQuantity = Number(updates.stockQuantity);
      const lowThreshold = updates.lowStockThreshold ?? existing.lowStockThreshold;
      if (updates.stockQuantity === 0) updates.stockStatus = 'out_of_stock';
      else if (updates.stockQuantity <= lowThreshold) updates.stockStatus = 'low_stock';
      else updates.stockStatus = 'in_stock';
    }

    const updatedProduct = db.updateProduct(existing.id, updates);
    return res.json({
      product: updatedProduct,
      message: 'Product updated successfully.',
    });
  } catch (err: any) {
    console.error('Update product error:', err);
    return res.status(500).json({ message: 'Failed to update product.' });
  }
});

// Admin: Delete product
router.delete('/:id', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  const existing = db.findProductById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const success = db.deleteProduct(existing.id);
  if (success) {
    return res.json({ message: 'Product deleted successfully.' });
  }
  return res.status(500).json({ message: 'Failed to delete product.' });
});

export default router;
