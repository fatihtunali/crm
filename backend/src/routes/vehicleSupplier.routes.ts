import { Router } from 'express';
import {
  getAllVehicleSuppliers,
  getVehicleSupplierById,
  createVehicleSupplier,
  updateVehicleSupplier,
  deleteVehicleSupplier,
  getVehicleSupplierStats,
} from '../controllers/vehicleSupplier.controller';
import {
  getTransferPricings,
  createTransferPricing,
  updateTransferPricing,
  deleteTransferPricing,
} from '../controllers/transferPricing.controller';
import {
  getAllocationPricings,
  createAllocationPricing,
  updateAllocationPricing,
  deleteAllocationPricing,
} from '../controllers/vehicleAllocationPricing.controller';
import { getAllCities, getCitiesWithCodes } from '../controllers/cities.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Tüm route'lar authentication gerektirir
router.use(authenticateToken);

// Cities endpoints (no auth needed for GET, but we keep it for consistency)
// GET /api/v1/vehicle-suppliers/cities - Tüm şehirler
router.get('/cities', getAllCities);

// GET /api/v1/vehicle-suppliers/cities/with-codes - Plaka kodlarıyla birlikte
router.get('/cities/with-codes', getCitiesWithCodes);

// GET /api/v1/vehicle-suppliers - Tüm tedarikçileri listele
router.get('/', getAllVehicleSuppliers);

// GET /api/v1/vehicle-suppliers/stats - İstatistikler
router.get('/stats', getVehicleSupplierStats);

// GET /api/v1/vehicle-suppliers/:id - Tek tedarikçi
router.get('/:id', getVehicleSupplierById);

// POST /api/v1/vehicle-suppliers - Yeni tedarikçi
router.post('/', createVehicleSupplier);

// PUT /api/v1/vehicle-suppliers/:id - Tedarikçi güncelle
router.put('/:id', updateVehicleSupplier);

// DELETE /api/v1/vehicle-suppliers/:id - Tedarikçi sil
router.delete('/:id', deleteVehicleSupplier);

// Transfer Pricing routes
// GET /api/v1/vehicle-suppliers/:supplierId/transfers - Tedarikçinin tüm transfer fiyatlarını listele
router.get('/:supplierId/transfers', getTransferPricings);

// POST /api/v1/vehicle-suppliers/:supplierId/transfers - Yeni transfer fiyatı ekle
router.post('/:supplierId/transfers', createTransferPricing);

// PUT /api/v1/vehicle-suppliers/transfers/:id - Transfer fiyatı güncelle
router.put('/transfers/:id', updateTransferPricing);

// DELETE /api/v1/vehicle-suppliers/transfers/:id - Transfer fiyatı sil
router.delete('/transfers/:id', deleteTransferPricing);

// Allocation Pricing routes
// GET /api/v1/vehicle-suppliers/:supplierId/allocations - Tedarikçinin tüm tahsis fiyatlarını listele
router.get('/:supplierId/allocations', getAllocationPricings);

// POST /api/v1/vehicle-suppliers/:supplierId/allocations - Yeni tahsis fiyatı ekle
router.post('/:supplierId/allocations', createAllocationPricing);

// PUT /api/v1/vehicle-suppliers/allocations/:id - Tahsis fiyatı güncelle
router.put('/allocations/:id', updateAllocationPricing);

// DELETE /api/v1/vehicle-suppliers/allocations/:id - Tahsis fiyatı sil
router.delete('/allocations/:id', deleteAllocationPricing);

export default router;
