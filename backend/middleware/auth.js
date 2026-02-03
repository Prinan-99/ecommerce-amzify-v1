import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { mockUserStore } from '../services/mockUserStore.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user = null;

    try {
      // Get user from database
      user = await prisma.users.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          first_name: true,
          last_name: true,
          is_active: true
        }
      });
    } catch (dbError) {
      // Fallback to mock user store when DB is unavailable
      user = await mockUserStore.findById(decoded.userId);
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    if (user.is_active === false) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireSeller = requireRole('seller');
export const requireAdmin = requireRole('admin');
export const requireCustomer = requireRole('customer');