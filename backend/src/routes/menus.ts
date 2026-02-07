import { Router } from 'express';
import {
  getAllMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
} from '../controllers/menuController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getAllMenus);
router.get('/:id', getMenuById);
router.post('/', authMiddleware(['cashier']), createMenu);
router.put('/:id', authMiddleware(['cashier']), updateMenu);
router.delete('/:id', authMiddleware(['cashier']), deleteMenu);

export default router;
