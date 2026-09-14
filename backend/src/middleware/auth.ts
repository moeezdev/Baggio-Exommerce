import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'baggio_super_secret_jwt_key_2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin';
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const signToken = (payload: TokenPayload, expiresIn: any = '7d') => {
  return (jwt as any).sign(payload, JWT_SECRET, { expiresIn });
};

export const authenticateCustomer = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    const user = db.findUserById(decoded.userId);
    if (!user || user.status === 'disabled') {
      return res.status(403).json({ message: 'Account is disabled or does not exist.' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }
};

export const authenticateAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Admin authentication required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access forbidden: Admin privilege required.' });
    }
    const user = db.findUserById(decoded.userId);
    if (!user || user.role !== 'admin' || user.status === 'disabled') {
      return res.status(403).json({ message: 'Admin account invalid or disabled.' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired admin session.' });
  }
};

export const optionalAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      req.user = decoded;
    } catch {
      // Ignore token verification errors for optional auth
    }
  }
  next();
};
