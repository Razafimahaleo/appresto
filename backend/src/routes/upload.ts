import { Router } from 'express';
import { uploadMenuImage } from '../controllers/uploadController';

const router = Router();

router.post('/menu-image', uploadMenuImage);

export default router;
