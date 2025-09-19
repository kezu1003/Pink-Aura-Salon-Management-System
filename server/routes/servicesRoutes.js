import { Router } from "express";
import {
  createService,
  deleteService,
  listServices,
  monthlyUsageReport,
  updateService,
} from "../controllers/serviceController.js";

import requireAuth from "../middleware/requireAuth.js";

const router = Router();


function requireAdminOrReceptionist(req, res, next) {
  const role = req?.user?.role || "customer";
  if (role === "admin" || role === "receptionist") return next();
  return res.status(403).json({ success: false, message: "Forbidden" });
}


router.get("/", listServices);


router.post("/", requireAuth, requireAdminOrReceptionist, createService);
router.put("/:id", requireAuth, requireAdminOrReceptionist, updateService);
router.delete("/:id", requireAuth, requireAdminOrReceptionist, deleteService);

/** Admin report */
router.get(
  "/report/monthly-usage",
  requireAuth,
  requireAdminOrReceptionist,
  monthlyUsageReport
);

export default router;
