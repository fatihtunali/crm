import { Router } from 'express';
import {
  getAllTourTemplates,
  getTourTemplateById,
  createTourTemplate,
  updateTourTemplate,
  deleteTourTemplate,
  addDayToTemplate,
  updateTemplateDay,
  deleteTemplateDay,
  addActivityToDay,
  updateTemplateActivity,
  deleteTemplateActivity,
  createReservationFromTemplate,
} from '../controllers/tourTemplate.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// ============================================
// TOUR TEMPLATE ROUTES
// ============================================

// Template CRUD
router.get('/tour-templates', getAllTourTemplates);
router.get('/tour-templates/:id', getTourTemplateById);
router.post('/tour-templates', createTourTemplate);
router.put('/tour-templates/:id', updateTourTemplate);
router.delete('/tour-templates/:id', deleteTourTemplate);

// ============================================
// TOUR TEMPLATE DAY ROUTES
// ============================================

router.post('/tour-templates/:templateId/days', addDayToTemplate);
router.put('/tour-template-days/:dayId', updateTemplateDay);
router.delete('/tour-template-days/:dayId', deleteTemplateDay);

// ============================================
// TOUR TEMPLATE ACTIVITY ROUTES
// ============================================

router.post('/tour-template-days/:dayId/activities', addActivityToDay);
router.put('/tour-template-activities/:activityId', updateTemplateActivity);
router.delete('/tour-template-activities/:activityId', deleteTemplateActivity);

// ============================================
// SPECIAL: CREATE RESERVATION FROM TEMPLATE
// ============================================

/**
 * POST /api/v1/tour-templates/:templateId/create-reservation
 *
 * Magic endpoint: Creates a new reservation based on template
 * Body: {
 *   customerId: number,
 *   startDate: string,
 *   participants: Array<Participant>,
 *   priceAdjustment?: number,
 *   costAdjustment?: number,
 *   customerNotes?: string,
 *   internalNotes?: string
 * }
 */
router.post('/tour-templates/:templateId/create-reservation', createReservationFromTemplate);

export default router;
