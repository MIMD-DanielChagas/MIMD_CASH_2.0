import { Router } from 'express';
import { getItems, createItem } from '../controllers/itemsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getItems);
router.post('/', authMiddleware, createItem);

export default router;
