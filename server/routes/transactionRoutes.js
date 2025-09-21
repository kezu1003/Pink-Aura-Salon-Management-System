import express from 'express';
import {
  getAllTransactions,
  getTransactionById,
  updateTransactionStatus,
  getTransactionsSummary,
  exportTransactions
} from '../controllers/transactionController.js';
import { requireAuth, requireRole } from '../middleware/userAuth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(requireAuth, requireRole('admin'));

// GET /api/admin/transactions
router.get('/', getAllTransactions);

// GET /api/admin/transactions/summary
router.get('/summary', getTransactionsSummary);

// GET /api/admin/transactions/export
router.get('/export', exportTransactions);

// GET /api/admin/transactions/:id
router.get('/:id', getTransactionById);

// PUT /api/admin/transactions/:id/status
router.put('/:id/status', updateTransactionStatus);

export default router;