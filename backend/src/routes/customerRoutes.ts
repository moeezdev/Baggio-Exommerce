import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// Admin: Get all customers with real order count and total spent
router.get('/', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  const { search, status } = req.query;
  const customers = db.getCustomers({
    search: search as string,
    status: status as string,
  });
  return res.json(customers);
});

// Admin: Get single customer details with their orders
router.get('/:id', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  const customer = db.findUserById(req.params.id);
  if (!customer || customer.role !== 'customer') {
    return res.status(404).json({ message: 'Customer not found.' });
  }

  const ordersResult = db.getOrders({ userId: customer.id, limit: 50 });

  return res.json({
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      createdAt: customer.createdAt,
    },
    orders: ordersResult.orders,
  });
});

// Admin: Update customer status (active/disabled)
router.put('/:id/status', authenticateAdmin, (req: AuthenticatedRequest, res: Response): any => {
  const { status } = req.body;
  if (!['active', 'disabled'].includes(status)) {
    return res.status(400).json({ message: 'Status must be active or disabled.' });
  }

  const updated = db.updateUser(req.params.id, { status });
  if (!updated) {
    return res.status(404).json({ message: 'Customer not found.' });
  }

  return res.json({
    customer: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      status: updated.status,
    },
    message: `Customer account has been ${status === 'active' ? 'enabled' : 'disabled'}.`,
  });
});

export default router;
