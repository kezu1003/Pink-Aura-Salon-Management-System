import express from 'express';
import { requireAuth, requireRole } from '../middleware/userAuth.js';
import {
  createPaymentIntent,
  completeOrder,
  handleWebhook,
  getPaymentIntent,
  refundPayment
} from '../controllers/stripeController.js';

const router = express.Router();

// Public webhook endpoint (no auth required)
// Note: This should be placed before express.json() middleware in your main app
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes (require authentication)
router.use(requireAuth);

// Create payment intent
router.post('/create-payment-intent', createPaymentIntent);

// Complete order after successful payment
router.post('/complete-order', completeOrder);

// Get payment intent details
router.get('/payment-intent/:paymentIntentId', getPaymentIntent);

// Admin only routes
router.post('/refund', requireRole('admin'), refundPayment);

export default router;