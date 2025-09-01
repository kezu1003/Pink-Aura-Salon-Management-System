import express from "express";
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct, updateStock } from "../controllers/productsController.js";
import { authUser } from "../middleware/userAuth.js";  
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// Public reads
router.get("/", listProducts);
router.get("/:id", getProduct);

// Admin writes
router.post("/", authUser, requireAdmin, createProduct);
router.patch("/:id", authUser, requireAdmin, updateProduct);
router.delete("/:id", authUser, requireAdmin, deleteProduct);
router.patch("/:id/stock", authUser, requireAdmin, updateStock);

export default router;
