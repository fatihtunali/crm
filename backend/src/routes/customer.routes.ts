import { Router } from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerContactHistory,
  addCustomerContactHistory,
  deleteCustomerContactHistory,
} from '../controllers/customer.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Tüm route'lar authentication gerektirir
router.use(authenticateToken);

// Customer CRUD
router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

// Customer Contact History
router.get('/:customerId/contact-history', getCustomerContactHistory);
router.post('/:customerId/contact-history', addCustomerContactHistory);
router.delete('/contact-history/:id', deleteCustomerContactHistory);

export default router;
