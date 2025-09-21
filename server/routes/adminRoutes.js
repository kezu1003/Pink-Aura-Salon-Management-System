import express from "express";
import userAuth, { requireRole } from "../middleware/userAuth.js";
import { listStaff, createStaff, updateStaff, setStatus } from "../controllers/staffController.js";

import {
  getAllTransactions,
  getTransactionById,
  updateTransactionStatus,
  getTransactionsSummary,
  exportTransactions,
  
} from '../controllers/transactionController.js';

import { appointmentsOverview, appointmentsOverviewPdf } from "../controllers/appointmentReportsController.js";


const router = express.Router();

router.use(userAuth, requireRole("admin")); // every route below requires admin

router.get("/staff", listStaff);
router.post("/staff", createStaff);
router.put("/staff/:id", updateStaff);
router.patch("/staff/:id/status", setStatus);




router.get('/transactions', getAllTransactions);
router.get('/transactions/summary', getTransactionsSummary);
router.get('/transactions/export', exportTransactions);
router.get('/transactions/:id', getTransactionById);
router.put('/transactions/:id/status', updateTransactionStatus);

router.get("/appointment-reports/overview", appointmentsOverview);
router.get("/appointment-reports/overview.pdf", appointmentsOverviewPdf);


export default router;
