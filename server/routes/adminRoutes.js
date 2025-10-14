import express from "express";
import userAuth, { requireRole } from "../middleware/userAuth.js";
import { listStaff, createStaff, updateStaff, setStatus } from "../controllers/staffController.js";
import { createStaffNotice, updateStaffNotice, deleteStaffNotice, getAllNotices } from "../controllers/staffDashController.js";

import {
  getAllTransactions,
  getTransactionById,
  updateTransactionStatus,
  getTransactionsSummary,
  exportTransactions,
  
} from '../controllers/transactionController.js';

import {
  getAppointmentsToday,
  getRevenueMonthly,
  getActiveClients,
  getStaffUtilization,
  getInventoryAlerts,
  getCustomerSatisfaction,
  getRevenueTrend,
  getAppointmentDistribution,
  getTopServices,
  getRecentActivities,
  getStaffOverview,
  generateReport,
} from '../controllers/adminDashboardController.js';

import {
  getAllMessages,
  deleteMessage,
  replyToMessage,
} from "../controllers/contactController.js";

import { appointmentsOverview } from "../controllers/appointmentReportsController.js";


const router = express.Router();

router.use(userAuth, requireRole("admin")); // every route below requires admin

router.get("/staff", listStaff);
router.post("/staff", createStaff);
router.put("/staff/:id", updateStaff);
router.patch("/staff/:id/status", setStatus);

// Staff notices management
router.get("/staff-notices", getAllNotices);
router.post("/staff-notices", createStaffNotice);
router.put("/staff-notices/:id", updateStaffNotice);
router.delete("/staff-notices/:id", deleteStaffNotice);




router.get('/transactions', getAllTransactions);
router.get('/transactions/summary', getTransactionsSummary);
router.get('/transactions/export', exportTransactions);
router.get('/transactions/:id', getTransactionById);
router.put('/transactions/:id/status', updateTransactionStatus);

router.get("/appointment-reports/overview", appointmentsOverview);

router.get('/dashboard/appointments-today', getAppointmentsToday);
router.get('/dashboard/revenue-monthly', getRevenueMonthly);
router.get('/dashboard/active-clients', getActiveClients);
router.get('/dashboard/staff-utilization', getStaffUtilization);
router.get('/dashboard/inventory-alerts', getInventoryAlerts);
router.get('/dashboard/customer-satisfaction', getCustomerSatisfaction);
router.get('/dashboard/revenue-trend', getRevenueTrend);
router.get('/dashboard/appointment-distribution', getAppointmentDistribution);
router.get('/dashboard/top-services', getTopServices);
router.get('/dashboard/recent-activities', getRecentActivities);
router.get('/dashboard/staff-overview', getStaffOverview);
router.get('/dashboard/report', generateReport);

router.get("/contact-messages",  getAllMessages);
router.delete("/contact-messages/:id",  deleteMessage);
router.post("/contact-messages/reply", replyToMessage);

export default router;
