import { Router } from 'express';
import {
  getAllAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  getAgentContactHistory,
  addAgentContactHistory,
  deleteAgentContactHistory,
} from '../controllers/agent.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Tüm route'lar authentication gerektirir
router.use(authenticateToken);

// Agent CRUD
router.get('/', getAllAgents);
router.get('/:id', getAgentById);
router.post('/', createAgent);
router.put('/:id', updateAgent);
router.delete('/:id', deleteAgent);

// Agent Contact History
router.get('/:agentId/contact-history', getAgentContactHistory);
router.post('/:agentId/contact-history', addAgentContactHistory);
router.delete('/contact-history/:id', deleteAgentContactHistory);

export default router;
