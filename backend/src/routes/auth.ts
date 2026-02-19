import { Router } from 'express';
import { handleGoogleCallback, validateToken } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/google/callback', handleGoogleCallback);
router.get('/validate', authMiddleware, validateToken);

export default router;
