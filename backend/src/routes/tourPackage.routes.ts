import { Router } from 'express';
import {
  getTourPackagesBySupplierId,
  getTourPackageById,
  createTourPackage,
  updateTourPackage,
  deleteTourPackage,
} from '../controllers/tourPackagePricing.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Tour Package Routes
router.get('/suppliers/:supplierId/tour-packages', getTourPackagesBySupplierId);
router.get('/tour-packages/:id', getTourPackageById);
router.post('/suppliers/:supplierId/tour-packages', createTourPackage);
router.put('/tour-packages/:id', updateTourPackage);
router.delete('/tour-packages/:id', deleteTourPackage);

export default router;
