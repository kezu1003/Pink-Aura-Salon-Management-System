import express from 'express';
import { requireAuth } from '../middleware/userAuth.js';
import {
  getUserPaymentMethods,
  getPaymentMethod,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  getDefaultPaymentMethod
} from '../controllers/paymentController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// GET /api/payments - Get all payment methods for user
router.get('/', getUserPaymentMethods);

// GET /api/payments/default - Get default payment method
router.get('/default', getDefaultPaymentMethod);

// GET /api/payments/:id - Get specific payment method
router.get('/:id', getPaymentMethod);

// POST /api/payments - Add new payment method
router.post('/', addPaymentMethod);

// PUT /api/payments/:id - Update payment method
router.put('/:id', updatePaymentMethod);

// DELETE /api/payments/:id - Delete payment method
router.delete('/:id', deletePaymentMethod);

// PATCH /api/payments/:id/default - Set as default payment method
router.patch('/:id/default', setDefaultPaymentMethod);

export default router;