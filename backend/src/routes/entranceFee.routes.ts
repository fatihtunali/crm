import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getAllEntranceFees } from '../controllers/entranceFeePricing.controller';

const router = Router();

// Tüm route'lar authentication gerektiriyor
router.use(authenticateToken);

// Get all entrance fees from all suppliers
router.get('/', getAllEntranceFees);

export default router;
