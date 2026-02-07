import { Request, Response } from 'express';
import { adminAuth } from '../config/firebase-admin';

export const login = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Token requis' });
    }
    const decoded = await adminAuth.verifyIdToken(idToken);
    res.json({
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role || 'chef',
    });
  } catch (error) {
    res.status(401).json({ error: 'Authentification échouée' });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false });
    }
    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);
    res.json({ valid: true });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
};
