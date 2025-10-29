import { Router } from 'express';
import { login, register, me } from '../controllers/auth.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', authenticateToken, me);

// Admin only routes
router.post(
  '/register',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'ADMIN'),
  register
);

export default router;
