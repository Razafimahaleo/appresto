import { Router } from 'express';
import menuRoutes from './menus';
import orderRoutes from './orders';
import authRoutes from './auth';
import uploadRoutes from './upload';

const router = Router();

router.use('/menus', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);

export default router;
