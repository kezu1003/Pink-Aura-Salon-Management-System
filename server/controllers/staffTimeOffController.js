import StaffTimeOff from "../models/StaffTimeOff.js";

export async function addTimeOff(req, res) {
  try {
    const { staffId, start, end, reason = "" } = req.body;
    if (!staffId || !start || !end) return res.json({ success: false, message: "staffId, start, end required" });
    const doc = await StaffTimeOff.create({ staff: staffId, start: new Date(start), end: new Date(end), reason });
    res.status(201).json({ success: true, timeOff: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}
export async function removeTimeOff(req, res) {
  try {
    await StaffTimeOff.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}
export async function listTimeOff(req, res) {
  try {
    const { staffId } = req.query;
    const q = staffId ? { staff: staffId } : {};
    const docs = await StaffTimeOff.find(q).populate("staff", "name jobTitle").sort({ start: -1 });
    res.json({ success: true, items: docs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}
