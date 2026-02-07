import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../config/firebase-admin';
import { UserRole } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: { uid: string; role: UserRole };
    }
  }
}

export const authMiddleware = (allowedRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant' });
    }
    const token = authHeader.split('Bearer ')[1];
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      const userRole = (decoded.role as UserRole) || 'chef';
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: 'Accès refusé' });
      }
      req.user = { uid: decoded.uid, role: userRole };
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token invalide' });
    }
  };
};
