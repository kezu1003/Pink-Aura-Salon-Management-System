import mongoose from "mongoose";
import { addMinutes } from "date-fns";
import Appointment from "../models/Appointment.js";
import Service from "../models/Service.js";
import userModel from "../models/userModel.js";
import StaffTimeOff from "../models/StaffTimeOff.js";

// timing defaults
const BIZ_TZ_OFFSET_MIN = 0; 
const DEFAULT_BUFFER_MIN = 5;
const HOLD_MINUTES = 10;

// per-slot capacity 
const MAX_PER_SLOT = Number(process.env.MAX_BOOKINGS_PER_SLOT || 1);

function endFromStart(start, durationMin, bufferMin = DEFAULT_BUFFER_MIN) {
  return addMinutes(new Date(start), durationMin + bufferMin);
}

/* capacity check for a given slot  */
async function slotIsFull({ date, startTime, excludeId = null }) {
  const q = {
    date, 
    startTime,
    status: { $in: ["pending", "confirmed"] },
  };
  if (excludeId) q._id = { $ne: excludeId };
  const count = await Appointment.countDocuments(q);
  return count >= MAX_PER_SLOT;
}

/*list own appointments */
export async function listMine(req, res) {
  try {
    const { status, from, to, page = 1, limit = 10 } = req.query;

    const customerId =
      (req.user && (req.user._id || req.user.id)) ||
      req.userId ||
      (req.auth && req.auth.id) ||
      null;

    if (!customerId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const q = { customer: customerId };
    if (status) q.status = status;
    if (from || to) {
      q.startTime = {};
      if (from) q.startTime.$gte = new Date(from);
      if (to) q.startTime.$lte = new Date(to);
    }

    const docs = await Appointment.find(q)
      .populate("services")
      .populate("staff", "name jobTitle")
      .sort({ startTime: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, appointments: docs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

/* list all */
export async function listAdmin(req, res) {
  try {
    const { status, staffId, serviceId, from, to } = req.query;
    const q = {};
    if (status) q.status = status;
    if (staffId && mongoose.isValidObjectId(staffId)) q.staff = staffId;
    if (serviceId && mongoose.isValidObjectId(serviceId)) q.services = serviceId;
    if (from || to) {
      q.startTime = {};
      if (from) q.startTime.$gte = new Date(from);
      if (to) q.startTime.$lte = new Date(to);
    }

    const docs = await Appointment.find(q)
      .populate("customer", "name email")
      .populate("services")
      .populate("staff", "name jobTitle")
      .sort({ startTime: 1 });

    res.json({ success: true, appointments: docs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

/* create booking  */
export async function createAppointment(req, res) {
  try {
    const {
      serviceIds = [],
      staffId = null,
      date,
      start,
      paymentMode = "online",
      notes = "",
    } = req.body;

    const customerId =
      (req.user && (req.user._id || req.user.id)) ||
      req.userId ||
      (req.auth && req.auth.id) ||
      null;

    if (!customerId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.json({ success: false, message: "Select at least one service" });
    }
    if (!date || !start) {
      return res.json({ success: false, message: "Date & start time are required" });
    }

    const services = await Service.find({ _id: { $in: serviceIds }, isActive: true });
    if (services.length !== serviceIds.length) {
      return res.json({ success: false, message: "Invalid services" });
    }

    // total duration = sum of service durations
    const durationMin = services.reduce((a, s) => a + Number(s.durationMins || 0), 0);
    const startTime = new Date(start);
    const endTime = endFromStart(startTime, durationMin);

    //  capacity guard
    if (await slotIsFull({ date, startTime })) {
      return res.json({ success: false, message: "This time slot is fully booked." });
    }

    // If staff chosen, ensure not overlapping & not time-off
    let staff = null;
    if (staffId) {
      staff = await userModel.findById(staffId).lean();
      if (!staff || staff.role !== "staff") {
        return res.json({ success: false, message: "Invalid staff" });
      }

      const off = await StaffTimeOff.countDocuments({
        staff: staffId,
        start: { $lt: endTime },
        end: { $gt: startTime },
      });
      if (off > 0) {
        return res.json({ success: false, message: "Staff unavailable in selected time" });
      }

      const overlaps = await Appointment.overlaps({ staff: staffId, startTime, endTime });
      if (overlaps > 0) {
        return res.json({ success: false, message: "Slot already taken" });
      }
    }

    const doc = await Appointment.create({
      customer: customerId,
      services: services.map((s) => s._id),
      staff: staff ? staff._id : null,
      date,
      startTime,
      endTime,
      status: "pending",
      paymentStatus: paymentMode === "online" ? "unpaid" : "paid",
      paymentMode,
      holdExpiresAt: paymentMode === "online" ? addMinutes(new Date(), HOLD_MINUTES) : null,
      notes,
      createdBy: customerId,
    });

    res.status(201).json({ success: true, appointment: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

/*  reschedule, reassign, update status */
export async function updateAppointment(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.json({ success: false, message: "Invalid id" });
    }

    const appt = await Appointment.findById(id);
    if (!appt) return res.json({ success: false, message: "Appointment not found" });

    const { start, staffId, notes } = req.body;
    if (notes != null) appt.notes = String(notes);

    if (req.body.status != null) {
      const nextStatus = String(req.body.status);
      const allowed = ["pending", "confirmed", "completed", "cancelled", "no_show"];

      if (!allowed.includes(nextStatus)) {
        return res.json({ success: false, message: "Invalid status" });
      }

      if (appt.status === "cancelled" && nextStatus !== "cancelled") {
        return res.json({ success: false, message: "Cancelled appointments are locked." });
      }

      const role =
        (req.user && req.user.role) ||
        (req.auth && req.auth.role) ||
        null;

      if (!role || !["admin", "staff"].includes(role)) {
        return res.status(403).json({ success: false, message: "Not allowed to change status" });
      }

      appt.status = nextStatus;
    }

    /* Reschedule */
    if (start) {
      const services = await Service.find({ _id: { $in: appt.services } });
      const durationMin = services.reduce((a, s) => a + Number(s.durationMins || 0), 0);
      const newStart = new Date(start);
      const newEnd = endFromStart(newStart, durationMin);

      //  capacity guard on reschedule 
      const newDateStr = newStart.toISOString().slice(0, 10);
      if (await slotIsFull({ date: newDateStr, startTime: newStart, excludeId: appt._id })) {
        return res.json({ success: false, message: "This time slot is fully booked." });
      }

      if (appt.staff) {
        const overlaps = await Appointment.overlaps({
          staff: appt.staff,
          startTime: newStart,
          endTime: newEnd,
          excludeId: appt._id,
        });
        if (overlaps > 0) {
          return res.json({ success: false, message: "New time conflicts with existing booking" });
        }
      }

      appt.startTime = newStart;
      appt.endTime = newEnd;
      appt.date = newDateStr;
    }

    /* Reassign staff */
    if (staffId !== undefined) {
      if (staffId === null) {
        appt.staff = null;
      } else {
        if (!mongoose.isValidObjectId(staffId)) {
          return res.json({ success: false, message: "Invalid staff" });
        }
        const staff = await userModel.findById(staffId).lean();
        if (!staff || staff.role !== "staff") {
          return res.json({ success: false, message: "Invalid staff" });
        }
        const overlaps = await Appointment.overlaps({
          staff: staffId,
          startTime: appt.startTime,
          endTime: appt.endTime,
          excludeId: appt._id,
        });
        if (overlaps > 0) {
          return res.json({ success: false, message: "Staff busy at that time" });
        }
        appt.staff = staffId;
      }
    }

    const updaterId =
      (req.user && (req.user._id || req.user.id)) ||
      req.userId ||
      (req.auth && req.auth.id) ||
      null;

    appt.updatedBy = updaterId || appt.updatedBy;
    await appt.save();

    const full = await Appointment.findById(appt._id)
      .populate("customer", "name email")
      .populate("services")
      .populate("staff", "name jobTitle");

    res.json({ success: true, appointment: full });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

/* cancel appointment */
export async function cancelAppointment(req, res) {
  try {
    const { id } = req.params;
    const appt = await Appointment.findById(id);
    if (!appt) return res.json({ success: false, message: "Appointment not found" });

    const updaterId =
      (req.user && (req.user._id || req.user.id)) ||
      req.userId ||
      (req.auth && req.auth.id) ||
      null;

    appt.status = "cancelled";
    appt.updatedBy = updaterId || appt.updatedBy;
    await appt.save();

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

/* mark paid, confirmed */
export async function markPaidAndConfirm(req, res) {
  try {
    const { id } = req.params;
    const appt = await Appointment.findById(id);
    if (!appt) return res.json({ success: false, message: "Appointment not found" });

    const updaterId =
      (req.user && (req.user._id || req.user.id)) ||
      req.userId ||
      (req.auth && req.auth.id) ||
      null;

    appt.paymentStatus = "paid";
    appt.status = "confirmed";
    appt.updatedBy = updaterId || appt.updatedBy;
    await appt.save();

    res.json({ success: true, appointment: appt });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

/** ADMIN grouped list **/
export async function listAdminGrouped(req, res) {
  try {
    const { by = "date" } = req.query;

    const groupExpr =
      by === "type"
        ? "$serviceCategory"
        : by === "assignment"
        ? { $cond: [{ $ifNull: ["$staff", false] }, "Assigned", "Unassigned"] }
        : { $dateToString: { date: "$startTime", format: "%Y-%m-%d" } };

    const pipeline = [
      { $lookup: { from: "services", localField: "services", foreignField: "_id", as: "servicesPop" } },
      {
        $addFields: {
          serviceNames: { $map: { input: "$servicesPop", as: "s", in: "$$s.name" } },
          serviceCategory: {
            $cond: [
              { $gt: [{ $size: "$servicesPop" }, 0] },
              { $arrayElemAt: ["$servicesPop.category", 0] },
              "Other",
            ],
          },
        },
      },

      // Customer
      { $lookup: { from: "users", localField: "customer", foreignField: "_id", as: "customerPop" } },
      { $unwind: { path: "$customerPop", preserveNullAndEmptyArrays: true } },

      // Staff
      { $lookup: { from: "users", localField: "staff", foreignField: "_id", as: "staffPop" } },
      { $unwind: { path: "$staffPop", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 1,
          date: 1,
          startTime: 1,
          endTime: 1,
          status: 1,
          paymentStatus: 1,
          serviceCategory: 1,
          serviceNames: 1,
          customer: { _id: "$customerPop._id", name: "$customerPop.name", email: "$customerPop.email" },
          staff: { _id: "$staffPop._id", name: "$staffPop.name", jobTitle: "$staffPop.jobTitle" },
        },
      },
      { $sort: { startTime: 1 } },
      { $group: { _id: groupExpr, items: { $push: "$$ROOT" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ];

    const apptCol = mongoose.connection.collection("appointments");
    const groups = await apptCol.aggregate(pipeline).toArray();

    res.json({ success: true, by, groups });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}
