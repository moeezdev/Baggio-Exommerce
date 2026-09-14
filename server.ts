import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import authRoutes from './backend/src/routes/authRoutes.ts';
import adminRoutes from './backend/src/routes/adminRoutes.ts';
import productRoutes from './backend/src/routes/productRoutes.ts';
import categoryRoutes from './backend/src/routes/categoryRoutes.ts';
import cartRoutes from './backend/src/routes/cartRoutes.ts';
import orderRoutes from './backend/src/routes/orderRoutes.ts';
import couponRoutes from './backend/src/routes/couponRoutes.ts';
import bannerRoutes from './backend/src/routes/bannerRoutes.ts';
import reviewRoutes from './backend/src/routes/reviewRoutes.ts';
import wishlistRoutes from './backend/src/routes/wishlistRoutes.ts';
import customerRoutes from './backend/src/routes/customerRoutes.ts';
import inventoryRoutes from './backend/src/routes/inventoryRoutes.ts';
import settingsRoutes from './backend/src/routes/settingsRoutes.ts';
import uploadRoutes from './backend/src/routes/uploadRoutes.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static uploads directory
  const uploadsPath = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/banners', bannerRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/upload', uploadRoutes);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      platform: 'Baggio Full-Stack E-Commerce',
      timestamp: new Date().toISOString(),
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Baggio Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Baggio Server] Failed to start:', err);
});
