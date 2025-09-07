import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Unavailability from "../models/Unavailability.js";
import Service from "../models/Service.js";
import userModel from "../models/userModel.js";
import { generateSlots, toDateISO, WORK_HOURS } from "../utils/slots.js";
import { sendMailSafe } from "../config/mailer.js";

const O = mongoose.Types.ObjectId;

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

async function ensureFree({ staffId, startTime, endTime, excludeId = null }) {
  const q = {
    staff: new O(staffId),
    status: { $in: ["booked", "confirmed", "rescheduled"] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };
  if (excludeId) q._id = { $ne: new O(excludeId) };

  const [appts, offs] = await Promise.all([
    Appointment.find(q).lean(),
    Unavailability.find({ staff: staffId, startTime: { $lt: endTime }, endTime: { $gt: startTime } }).lean(),
  ]);
  return !(appts.length || offs.length);
}

// GET 

export async function getAvailability(req, res) {
  try {
    const { serviceId, date, staffId } = req.query;
    if (!serviceId || !date) return res.json({ success: false, message: "serviceId and date are required" });

    const service = await Service.findById(serviceId).lean();
    if (!service || !service.isActive) return res.json({ success: false, message: "Service not found" });

    const staffFilter = staffId ? { _id: new O(staffId), role: "staff" } : { role: "staff" };
    const staff = await userModel.find(staffFilter, { name: 1, email: 1 }).lean();

    const dayStart = toDateISO(date, WORK_HOURS.start);
    const dayEnd = toDateISO(date, WORK_HOURS.end);

    const result = [];
    for (const s of staff) {
      const [appts, offs] = await Promise.all([
        Appointment.find({
          staff: s._id,
          status: { $in: ["booked", "confirmed", "rescheduled"] },
          startTime: { $lt: dayEnd },
          endTime: { $gt: dayStart },
        }).lean(),
        Unavailability.find({ staff: s._id, startTime: { $lt: dayEnd }, endTime: { $gt: dayStart } }).lean(),
      ]);
      const busy = [
        ...appts.map((a) => ({ start: a.startTime, end: a.endTime })),
        ...offs.map((o) => ({ start: o.startTime, end: o.endTime })),
      ];
      const slots = generateSlots({
        startWindow: dayStart,
        endWindow: dayEnd,
        duration: Number(service.durationMins),
        step: 15,
        busy,
      });
      result.push({ staff: { id: s._id, name: s.name }, slots });
    }

    res.json({
      success: true,
      date,
      service: { id: service._id, durationMins: service.durationMins },
      availability: result.filter((r) => r.slots.length),
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

// POST appointments  

export async function createAppointment(req, res) {
  try {
    const { serviceId, staffId, startTime, customerId } = req.body;
    if (!serviceId || !staffId || !startTime) {
      return res.json({ success: false, message: "serviceId, staffId, startTime required" });
    }

    const [service, staffUser] = await Promise.all([
      Service.findById(serviceId).lean(),
      userModel.findById(staffId).lean(),
    ]);
    if (!service) return res.json({ success: false, message: "Service not found" });
    if (!staffUser || staffUser.role !== "staff") return res.json({ success: false, message: "Staff not found" });

    const start = new Date(startTime);
    const end = new Date(start.getTime() + Number(service.durationMins) * 60000);

    const free = await ensureFree({ staffId, startTime: start, endTime: end });
    if (!free) return res.status(409).json({ success: false, message: "Selected time is no longer available" });

    const customer = customerId || req.user?._id;
    if (!customer) return res.status(401).json({ success: false, message: "Login required" });

    const appt = await Appointment.create({
      customer,
      staff: staffId,
      service: serviceId,
      startTime: start,
      endTime: end,
      status: "booked",
    });

    // emails 

    const [cus, svc] = await Promise.all([
      userModel.findById(customer).lean(),
      Service.findById(serviceId).lean(),
    ]);
    const when = start.toLocaleString();
    await sendMailSafe({
      to: [cus?.email, staffUser?.email].filter(Boolean),
      subject: `Appointment booked — ${svc?.name} @ ${when}`,
      text: `Your appointment for ${svc?.name} is booked for ${when}.`,
    });

    res.status(201).json({ success: true, appointment: appt });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

/** GET appointments-me */
export async function myAppointments(req, res) {
  try {
    const list = await Appointment.find({ customer: req.user._id })
      .populate("service", "name durationMins")
      .populate("staff", "name")
      .sort({ startTime: -1 });
    res.json({ success: true, appointments: list });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}


export async function updateAppointment(req, res) {
  try {
    const { id } = req.params;
    const { startTime, staffId, status, notes } = req.body;
    const appt = await Appointment.findById(id);
    if (!appt) return res.json({ success: false, message: "Appointment not found" });

    // customers can only modify their own

    const isAdmin = req.user?.role === "admin" || req.user?.role === "receptionist";
    if (!isAdmin && String(appt.customer) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    if (startTime || staffId) {
      const service = await Service.findById(appt.service).lean();
      const newStart = startTime ? new Date(startTime) : appt.startTime;
      const newEnd = new Date(newStart.getTime() + Number(service.durationMins) * 60000);
      const newStaff = staffId || String(appt.staff);

      const free = await ensureFree({ staffId: newStaff, startTime: newStart, endTime: newEnd, excludeId: id });
      if (!free) return res.status(409).json({ success: false, message: "New time is not available" });

      appt.startTime = newStart;
      appt.endTime = newEnd;
      appt.staff = newStaff;
      appt.status = "rescheduled";
    }

    if (status) appt.status = status;
    if (typeof notes === "string") appt.notes = notes;
    await appt.save();

    // email 

    const [cus, stf, svc] = await Promise.all([
      userModel.findById(appt.customer).lean(),
      userModel.findById(appt.staff).lean(),
      Service.findById(appt.service).lean(),
    ]);
    const when = appt.startTime.toLocaleString();
    await sendMailSafe({
      to: [cus?.email, stf?.email].filter(Boolean),
      subject: `Appointment updated — ${svc?.name} @ ${when}`,
      text: `Your appointment has been updated. New time: ${when}.`,
    });

    res.json({ success: true, appointment: appt });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

// DELETE

export async function cancelAppointment(req, res) {
  try {
    const { id } = req.params;
    const appt = await Appointment.findById(id);
    if (!appt) return res.json({ success: false, message: "Appointment not found" });

    const isAdmin = req.user?.role === "admin" || req.user?.role === "receptionist";
    if (!isAdmin && String(appt.customer) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    appt.status = "cancelled";
    await appt.save();

    const [cus, stf, svc] = await Promise.all([
      userModel.findById(appt.customer).lean(),
      userModel.findById(appt.staff).lean(),
      Service.findById(appt.service).lean(),
    ]);
    const when = appt.startTime.toLocaleString();
    await sendMailSafe({
      to: [cus?.email, stf?.email].filter(Boolean),
      subject: `Appointment cancelled — ${svc?.name} @ ${when}`,
      text: `The appointment for ${svc?.name} at ${when} has been cancelled.`,
    });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

//ADMIN

export async function listAppointmentsAdmin(req, res) {
  try {
    const { from, to, staffId, serviceId, status } = req.query;
    const q = {};
    if (from || to) q.startTime = {};
    if (from) q.startTime.$gte = new Date(from);
    if (to) q.startTime.$lte = new Date(to);
    if (staffId) q.staff = staffId;
    if (serviceId) q.service = serviceId;
    if (status) q.status = status;

    const list = await Appointment.find(q)
      .populate("customer", "name email")
      .populate("staff", "name email")
      .populate("service", "name durationMins")
      .sort({ startTime: 1 });

    res.json({ success: true, appointments: list });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

// STAFF/ADMIN POST 

export async function addUnavailability(req, res) {
  try {
    const { startTime, endTime, reason } = req.body;
    const staffId = req.user._id; 
    if (!startTime || !endTime) return res.json({ success: false, message: "startTime and endTime required" });

    const off = await Unavailability.create({
      staff: staffId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      reason: reason || "",
    });
    res.status(201).json({ success: true, unavailability: off });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}
