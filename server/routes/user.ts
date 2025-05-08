import { Router } from 'express';
import { withAuth, AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

router.get('/profile', withAuth, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

export default router; 