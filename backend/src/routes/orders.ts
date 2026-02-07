import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', createOrder);
router.get('/', authMiddleware(['chef', 'cashier']), getOrders);
router.get('/:id', authMiddleware(['chef', 'cashier']), getOrderById);
router.patch('/:id/status', authMiddleware(['chef']), updateOrderStatus);

export default router;
