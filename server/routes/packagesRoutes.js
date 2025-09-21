import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import {
  listPackages,
  getPackage,
  createPackage,
  updatePackage,
  archivePackage,
  restorePackage,
  deletePackage,
} from "../controllers/packagesController.js";

const router = Router();

function requireAdminOrReceptionist(req, res, next) {
  const role = req?.user?.role || "customer";
  if (role === "admin" || role === "receptionist") return next();
  return res.status(403).json({ success: false, message: "Forbidden" });
}

// Public reads
router.get("/", listPackages);
router.get("/:id", getPackage);

// Admin
router.post("/", requireAuth, requireAdminOrReceptionist, createPackage);
router.put("/:id", requireAuth, requireAdminOrReceptionist, updatePackage);
router.patch("/:id/archive", requireAuth, requireAdminOrReceptionist, archivePackage);
router.patch("/:id/restore", requireAuth, requireAdminOrReceptionist, restorePackage);
router.delete("/:id", requireAuth, requireAdminOrReceptionist, deletePackage);

export default router;
