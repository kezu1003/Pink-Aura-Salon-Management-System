import { Router } from "express";
import { appointmentsOverview } from "../controllers/reportsController.js";

const router = Router();

router.get("/appointments", appointmentsOverview);

export default router;
