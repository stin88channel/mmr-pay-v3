import { Router } from 'express';
import { getSecuritySettings, updateSecuritySettings } from '../controllers/security';
import { withAuth } from '../middleware/auth';

const router = Router();

router.get('/settings', withAuth, getSecuritySettings as any);
router.put('/settings', withAuth, updateSecuritySettings as any);

export default router; 