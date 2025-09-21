import express from "express";
import { 
  checkout, 
  completeOrder,
  getUserOrders, 
  getOrderById, 
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStats
} from "../controllers/ordersController.js";
import { requireAuth, requireRole } from "../middleware/userAuth.js";

const router = express.Router();

// Customer routes (require authentication)
router.use(requireAuth);

// Legacy checkout (keeping for backward compatibility)
router.post("/checkout", checkout);

// Complete order after successful Stripe payment
router.post("/complete-order", completeOrder);

// Get user's orders
router.get("/", getUserOrders);

// Get specific order
router.get("/:orderId", getOrderById);

// Cancel order
router.patch("/:orderId/cancel", cancelOrder);

// Admin routes (require admin role)
router.get("/admin/all", requireRole("admin"), getAllOrders);
router.get("/admin/stats", requireRole("admin"), getOrderStats);
router.patch("/admin/:orderId/status", requireRole("admin"), updateOrderStatus);

export default router;