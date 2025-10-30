import { Router } from 'express';
import {
  getAllGuides,
  getGuideById,
  createGuide,
  updateGuide,
  deleteGuide,
  getGuideStats,
} from '../controllers/guide.controller';
import {
  getGuidePricings,
  createGuidePricing,
  updateGuidePricing,
  deleteGuidePricing,
} from '../controllers/guidePricing.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/', getAllGuides);
router.get('/stats', getGuideStats);
router.get('/:id', getGuideById);
router.post('/', createGuide);
router.put('/:id', updateGuide);
router.delete('/:id', deleteGuide);

// Guide Pricing Routes
router.get('/:guideId/pricings', getGuidePricings);
router.post('/:guideId/pricings', createGuidePricing);
router.put('/pricings/:id', updateGuidePricing);
router.delete('/pricings/:id', deleteGuidePricing);

export default router;
