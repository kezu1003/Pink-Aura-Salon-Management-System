import userModel from "../models/userModel.js";
import { capsFor } from "../config/capabilities.js";

export const staffMe = async (req, res) => {
  const user = await userModel.findById(req.userId).lean();
  if (!user) return res.status(401).json({ success: false, message: "User not found" });
  const permissions = capsFor(user);
  return res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      jobTitle: user.jobTitle || "",
      permissions,
    },
  });
};

// Mock data now; swap to DB models later
export const listSchedule = async (req, res) => {
  const now = Date.now();
  const items = [
    { _id: "apt1", serviceType: "Haircut", startAt: new Date(now + 30 * 60 * 1000), endAt: new Date(now + 90 * 60 * 1000), status: "scheduled" },
    { _id: "apt2", serviceType: "Facial",  startAt: new Date(now + 2 * 60 * 60 * 1000), endAt: new Date(now + 3 * 60 * 60 * 1000), status: "scheduled" },
  ];
  return res.json({ success: true, items });
};

export const startAppointment = async (_req, res) => {
  return res.json({ success: true, message: "Appointment started" });
};
export const completeAppointment = async (_req, res) => {
  return res.json({ success: true, message: "Appointment completed" });
};

export const listAnnouncements = async (_req, res) => {
  return res.json({ success: true, items: [{ _id: "a1", title: "Team Meeting", body: "Friday 5 PM. Be on time." }] });
};

export const createInventoryRequest = async (_req, res) => {
  return res.json({ success: true, message: "Inventory request created" });
};

// Supplier
export const listPOs = async (_req, res) => {
  return res.json({
    success: true,
    items: [
      { _id: "po1", code: "PO-1001", status: "shipped" },
      { _id: "po2", code: "PO-1002", status: "pending" },
    ],
  });
};
export const fulfillPO = async (_req, res) => {
  return res.json({ success: true, message: "PO fulfilled" });
};

export const listServices = async (_req, res) => {
  return res.json({ success: true, items: [{ name: "Basic Facial" }, { name: "Hair Color" }, { name: "Nail Art" }] });
};
