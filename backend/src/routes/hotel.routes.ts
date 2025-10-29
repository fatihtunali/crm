import { Router } from 'express';
import {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  getHotelStats,
} from '../controllers/hotel.controller';
import {
  getHotelPricings,
  createHotelPricing,
  updateHotelPricing,
  deleteHotelPricing,
} from '../controllers/hotelPricing.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Tüm route'lar authentication gerektirir
router.use(authenticateToken);

// GET /api/v1/hotels - Tüm otelleri listele
router.get('/', getAllHotels);

// GET /api/v1/hotels/stats - İstatistikler
router.get('/stats', getHotelStats);

// GET /api/v1/hotels/:id - Tek otel
router.get('/:id', getHotelById);

// POST /api/v1/hotels - Yeni otel
router.post('/', createHotel);

// PUT /api/v1/hotels/:id - Otel güncelle
router.put('/:id', updateHotel);

// DELETE /api/v1/hotels/:id - Otel sil
router.delete('/:id', deleteHotel);

// Pricing routes
// GET /api/v1/hotels/:hotelId/pricings - Otelin tüm fiyatlarını listele
router.get('/:hotelId/pricings', getHotelPricings);

// POST /api/v1/hotels/:hotelId/pricings - Yeni fiyat ekle
router.post('/:hotelId/pricings', createHotelPricing);

// PUT /api/v1/hotels/pricings/:id - Fiyat güncelle
router.put('/pricings/:id', updateHotelPricing);

// DELETE /api/v1/hotels/pricings/:id - Fiyat sil
router.delete('/pricings/:id', deleteHotelPricing);

export default router;
