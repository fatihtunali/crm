import { Router } from 'express';
import {
  getAllGuides,
  getGuideById,
  createGuide,
  updateGuide,
  deleteGuide,
  getGuideStats,
} from '../controllers/guide.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/', getAllGuides);
router.get('/stats', getGuideStats);
router.get('/:id', getGuideById);
router.post('/', createGuide);
router.put('/:id', updateGuide);
router.delete('/:id', deleteGuide);

export default router;
