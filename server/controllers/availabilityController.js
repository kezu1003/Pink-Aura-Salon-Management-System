import { addMinutes } from "date-fns";
import Appointment from "../models/Appointment.js";
import Service from "../models/Service.js";
import StaffTimeOff from "../models/StaffTimeOff.js";
import userModel from "../models/userModel.js";


const WORK_START = { h: 10, m: 0 }; 
const WORK_END =   { h: 17, m: 0 }; 
const SLOT_INTERVAL_MIN = 15;
const BUFFER_MIN = 5;

// Build the day's working window 
function buildDay(dateStr) {
  const d = new Date(dateStr + "T00:00:00.000Z");
  const s = new Date(d); s.setUTCHours(WORK_START.h, WORK_START.m, 0, 0);
  const e = new Date(d); e.setUTCHours(WORK_END.h, WORK_END.m, 0, 0);
  return { dayStart: s, dayEnd: e };
}

// Check overlap: (aStart, aEnd) overlaps (bStart, bEnd)
function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

export async function slotsForDate(req, res) {
  try {
    const { serviceId, date, staffId } = req.query;
    if (!serviceId || !date) {
      return res.json({ success: false, message: "serviceId & date required" });
    }

    const service = await Service.findById(serviceId).lean();
    if (!service || !service.isActive) {
      return res.json({ success: false, message: "Invalid service" });
    }

    const { dayStart, dayEnd } = buildDay(date);
    const blockMin = Number(service.durationMins) + BUFFER_MIN;

    // Build base candidates at fixed interval
    const candidates = [];
    for (let t = new Date(dayStart); t < dayEnd; t = addMinutes(t, SLOT_INTERVAL_MIN)) {
      const start = new Date(t);
      const end = addMinutes(new Date(t), blockMin);
      if (end <= dayEnd) {
        candidates.push({ start, end });
      }
    }

   
    if (staffId) {
      // Fetch this staff's bookings on that day (pending/confirmed)
      const appts = await Appointment.find({
        staff: staffId,
        status: { $in: ["pending", "confirmed"] },
        startTime: { $lt: dayEnd },
        endTime: { $gt: dayStart },
      }).select("startTime endTime").lean();

      // Staff time off
      const offs = await StaffTimeOff.find({
        staff: staffId,
        start: { $lt: dayEnd },
        end: { $gt: dayStart },
      }).select("start end").lean();

      const slots = candidates.filter(({ start, end }) => {
        if (appts.some(a => overlaps(start, end, a.startTime, a.endTime))) return false;
        if (offs.some(o => overlaps(start, end, o.start, o.end))) return false;
        return true;
      });

      return res.json({
        success: true,
        slots: slots.map(s => ({
          start: s.start.toISOString(),
          end: s.end.toISOString(),
          staffId,
        })),
      });
    }

  
    // Preload all active staff, their bookings and time-offs once 
    const staffList = await userModel.find({ role: "staff", status: "active" }).select("_id name").lean();
    if (staffList.length === 0) {
      return res.json({ success: true, slots: [] });
    }

    const staffIds = staffList.map(s => s._id);

    // All appts for these staff in the window

    const apptsAll = await Appointment.find({
      staff: { $in: staffIds },
      status: { $in: ["pending", "confirmed"] },
      startTime: { $lt: dayEnd },
      endTime: { $gt: dayStart },
    }).select("staff startTime endTime").lean();

    // All time-offs for these staff in the window
    const offsAll = await StaffTimeOff.find({
      staff: { $in: staffIds },
      start: { $lt: dayEnd },
      end: { $gt: dayStart },
    }).select("staff start end").lean();

    // Build quick lookup maps

    const apptsMap = new Map(); 
    const offsMap = new Map(); 
    for (const s of staffList) {
      apptsMap.set(String(s._id), []);
      offsMap.set(String(s._id), []);
    }
    for (const a of apptsAll) {
      const key = String(a.staff);
      apptsMap.get(key)?.push({ startTime: a.startTime, endTime: a.endTime });
    }
    for (const o of offsAll) {
      const key = String(o.staff);
      offsMap.get(key)?.push({ start: o.start, end: o.end });
    }

    const results = [];
    // For each candidate slot, find the first staff free for that block

    for (const cand of candidates) {
      const { start, end } = cand;

      // iterate staff and pick first free

      let pickedStaff = null;
      for (const s of staffList) {
        const key = String(s._id);
        const aList = apptsMap.get(key) || [];
        const oList = offsMap.get(key) || [];

        const conflictAppt = aList.some(a => overlaps(start, end, a.startTime, a.endTime));
        if (conflictAppt) continue;

        const conflictOff = oList.some(o => overlaps(start, end, o.start, o.end));
        if (conflictOff) continue;

        pickedStaff = s._id;
        break;
      }

      if (pickedStaff) {
        results.push({
          start: start.toISOString(),
          end: end.toISOString(),
          staffId: pickedStaff,
        });
      }
    }

    return res.json({ success: true, slots: results });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}
