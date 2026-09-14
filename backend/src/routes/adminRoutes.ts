import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.ts';
import { signToken, authenticateAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// Admin Login
router.post('/login', async (req, res): Promise<any> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ message: 'This admin account has been disabled.' });
    }

    const match = bcrypt.compareSync(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: 'admin',
    });

    return res.json({
      token,
      admin: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: 'Admin authentication successful.',
    });
  } catch (err: any) {
    console.error('Admin login error:', err);
    return res.status(500).json({ message: 'Server error during admin login.' });
  }
});

// Admin Me
router.get('/me', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  const admin = db.findUserById(req.user!.userId);
  if (!admin || admin.role !== 'admin') {
    return res.status(404).json({ message: 'Admin not found.' });
  }

  return res.json({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    status: admin.status,
  });
});

// Admin Dashboard Real Statistics
router.get('/dashboard', authenticateAdmin, (_req: AuthenticatedRequest, res: Response): any => {
  try {
    const stats = db.getDashboardStats();
    return res.json(stats);
  } catch (err: any) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ message: 'Failed to compute dashboard metrics.' });
  }
});

// Admin Reports with date filter
router.get('/reports', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  try {
    const range = (req.query.range as any) || '30days';
    const reports = db.getReports(range);
    return res.json(reports);
  } catch (err: any) {
    console.error('Reports error:', err);
    return res.status(500).json({ message: 'Failed to compute reports.' });
  }
});

// Admin Catalog & Store Data Control (Optional import of sample catalog or purge)
router.post('/seed-sample-catalog', authenticateAdmin, (_req: AuthenticatedRequest, res: Response): any => {
  try {
    const result = db.seedSampleCatalog();
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Failed to seed sample catalog.' });
  }
});

router.post('/clear-all-data', authenticateAdmin, (_req: AuthenticatedRequest, res: Response): any => {
  try {
    const result = db.clearAllData();
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Failed to clear store data.' });
  }
});

export default router;
