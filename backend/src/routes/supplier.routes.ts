import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../controllers/supplier.controller';
import {
  getEntranceFeePricings,
  createEntranceFeePricing,
  updateEntranceFeePricing,
  deleteEntranceFeePricing,
} from '../controllers/entranceFeePricing.controller';
import {
  getSupplierPricings,
  createSupplierPricing,
  updateSupplierPricing,
  deleteSupplierPricing,
} from '../controllers/supplierPricing.controller';

const router = Router();

// Tüm route'lar authentication gerektiriyor
router.use(authenticateToken);

// Supplier CRUD Routes
router.get('/', getAllSuppliers);
router.get('/:id', getSupplierById);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);

// Entrance Fee Pricing Routes
router.get('/:supplierId/entrance-fees', getEntranceFeePricings);
router.post('/:supplierId/entrance-fees', createEntranceFeePricing);
router.put('/entrance-fees/:id', updateEntranceFeePricing);
router.delete('/entrance-fees/:id', deleteEntranceFeePricing);

// Supplier Service Pricing Routes
router.get('/:supplierId/service-pricings', getSupplierPricings);
router.post('/:supplierId/service-pricings', createSupplierPricing);
router.put('/service-pricings/:id', updateSupplierPricing);
router.delete('/service-pricings/:id', deleteSupplierPricing);

export default router;
