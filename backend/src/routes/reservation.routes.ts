import express from 'express';
import {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  addPayment,
} from '../controllers/reservation.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(authenticateToken);

// Reservation routes
router.get('/', getAllReservations);
router.get('/:id', getReservationById);
router.post('/', createReservation);
router.put('/:id', updateReservation);
router.delete('/:id', deleteReservation);

// Payment routes
router.post('/:id/payments', addPayment);

export default router;
