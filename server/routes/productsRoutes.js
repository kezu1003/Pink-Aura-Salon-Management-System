import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
} from "../controllers/productsController.js";
import { requireAuth, requireRole } from "../middleware/userAuth.js";
import { generateProductReport } from "../controllers/productReportsController.js"; 

const router = express.Router();


router.get("/report", requireAuth, requireRole("admin"), generateProductReport); 

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post("/", requireAuth, requireRole("admin"), createProduct);
router.put("/:id", requireAuth, requireRole("admin"), updateProduct);
router.delete("/:id", requireAuth, requireRole("admin"), deleteProduct);
router.patch("/:id/stock", requireAuth, requireRole("admin"), adjustStock);

export default router;
