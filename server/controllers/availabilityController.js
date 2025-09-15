import { addMinutes, startOfDay, endOfDay } from "date-fns";
import Appointment from "../models/Appointment.js";
import Service from "../models/Service.js";
import StaffTimeOff from "../models/StaffTimeOff.js";
import userModel from "../models/userModel.js";

const WORK_START = { h: 9, m: 0 };
const WORK_END = { h: 18, m: 0 };
const BUFFER_MIN = 5;

function buildDay(dateStr) {
  const d = new Date(dateStr + "T00:00:00.000Z");
  const s = new Date(d); s.setUTCHours(WORK_START.h, WORK_START.m, 0, 0);
  const e = new Date(d); e.setUTCHours(WORK_END.h, WORK_END.m, 0, 0);
  return { dayStart: s, dayEnd: e };
}

export async function slotsForDate(req, res) {
  try {
    const { serviceId, date, staffId } = req.query;
    if (!serviceId || !date) return res.json({ success: false, message: "serviceId & date required" });

    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) return res.json({ success: false, message: "Invalid service" });

    const { dayStart, dayEnd } = buildDay(date);
    const duration = Number(service.durationMins) + BUFFER_MIN;

    // Base candidates: every 15 minutes within working hours

    const step = 15;
    const candidates = [];
    for (let t = new Date(dayStart); t < dayEnd; t = addMinutes(t, step)) {
      candidates.push({ start: new Date(t), end: addMinutes(new Date(t), duration) });
    }

    // If staff provided  check conflicts against their bookings

    if (staffId) {
      const appts = await Appointment.find({
        staff: staffId,
        status: { $in: ["pending", "confirmed"] },
        startTime: { $lt: dayEnd },
        endTime: { $gt: dayStart },
      }).select("startTime endTime");

      const offs = await StaffTimeOff.find({
        staff: staffId,
        start: { $lt: dayEnd },
        end: { $gt: dayStart },
      }).select("start end");

      const slots = candidates.filter(({ start, end }) => {
        if (end > dayEnd) return false;
        if (appts.some(a => start < a.endTime && end > a.startTime)) return false;
        if (offs.some(o => start < o.end && end > o.start)) return false;
        return true;
      });

      return res.json({
        success: true,
        slots: slots.map(s => ({ start: s.start, end: s.end, staffId })),
      });
    }

    // Any staff: return slots that are free for at least one staff

    const staffList = await userModel.find({ role: "staff", status: "active" }).select("_id name");
    const results = [];

    for (const cand of candidates) {
      for (const st of staffList) {
        const overlaps = await Appointment.overlaps({ staff: st._id, startTime: cand.start, endTime: cand.end });
        if (overlaps > 0) continue;
        const off = await StaffTimeOff.countDocuments({ staff: st._id, start: { $lt: cand.end }, end: { $gt: cand.start } });
        if (off > 0) continue;
        results.push({ start: cand.start, end: cand.end, staffId: st._id });
        break; 
      }
    }

    res.json({ success: true, slots: results });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}
