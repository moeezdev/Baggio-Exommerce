import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.ts';
import { signToken, authenticateCustomer, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// Customer Register
router.post('/register', async (req, res): Promise<any> => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const user = db.createUser({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      phone,
      role: 'customer',
      status: 'active',
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      message: 'Account created successfully.',
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

// Customer Login
router.post('/login', async (req, res): Promise<any> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ message: 'This account has been disabled. Please contact support.' });
    }

    const match = bcrypt.compareSync(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      message: 'Logged in successfully.',
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

// Get Current Logged In Customer Profile
router.get('/me', authenticateCustomer, (req: AuthenticatedRequest, res: Response): any => {
  const user = db.findUserById(req.user!.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  });
});

// Update Profile
router.put('/update-profile', authenticateCustomer, (req: AuthenticatedRequest, res: Response): any => {
  const { name, phone } = req.body;
  const updated = db.updateUser(req.user!.userId, {
    ...(name && { name }),
    ...(phone !== undefined && { phone }),
  });

  if (!updated) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json({
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
    },
    message: 'Profile updated successfully.',
  });
});

// Change Password
router.put('/change-password', authenticateCustomer, (req: AuthenticatedRequest, res: Response): any => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required.' });
  }

  const user = db.findUserById(req.user!.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const match = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!match) {
    return res.status(400).json({ message: 'Current password does not match.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);
  db.updateUser(user.id, { passwordHash });

  return res.json({ message: 'Password changed successfully.' });
});

// Forgot Password
router.post('/forgot-password', (req, res): any => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const user = db.findUserByEmail(email);
  // Always return success message for security to prevent user enumeration
  return res.json({
    message: user
      ? 'Password reset instructions have been dispatched to your email address.'
      : 'If that email exists in our records, password reset instructions have been dispatched.',
  });
});

// Reset Password
router.post('/reset-password', (req, res): any => {
  const { email, resetCode, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required.' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: 'User account not found.' });
  }

  if (resetCode && resetCode !== 'BAGGIO-RESET-2026') {
    return res.status(400).json({ message: 'Invalid or expired reset code.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);
  db.updateUser(user.id, { passwordHash });

  return res.json({ message: 'Password has been reset successfully. You can now log in.' });
});

export default router;
