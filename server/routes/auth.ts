import { Router } from 'express';
import { register, login, logout, changePassword, getMe } from '../controllers/auth';
import { withAuth } from '../middleware/auth';

const router = Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.post('/logout', withAuth as any, logout as any);
router.post('/change-password', withAuth as any, changePassword as any);
router.get('/me', withAuth as any, getMe as any);

export default router; 