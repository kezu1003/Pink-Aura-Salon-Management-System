import mongoose from "mongoose";

const O = mongoose.Types.ObjectId;


async function buildAppointmentsOverview({ from, to, staffId, serviceId }) {
  const pipeline = [
    {
      $project: {
        ts: { $ifNull: ["$startTime", "$start"] },      
        staffRef: { $ifNull: ["$staff", "$staffId"] },  
        serviceRef: { $ifNull: ["$service", "$serviceId"] }, 
        status: { $toLower: "$status" },
        customer: 1,
      },
    },
  ];

  const match = {};
  if (from || to) {
    match.ts = {};
    if (from) match.ts.$gte = new Date(from + "T00:00:00.000Z");
    if (to) match.ts.$lte = new Date(to + "T23:59:59.999Z");
  }
  if (staffId && O.isValid(staffId)) match.staffRef = new O(staffId);
  if (serviceId && O.isValid(serviceId)) match.serviceRef = new O(serviceId);
  if (Object.keys(match).length) pipeline.push({ $match: match });

  const appts = mongoose.connection.collection("appointments");

  // Totals
  const totalsAgg = await appts.aggregate([
    ...pipeline,
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]).toArray();

  const totals = totalsAgg.reduce((acc, r) => { acc[r._id] = r.count; return acc; }, {});
  totals.total = Object.values(totals).reduce((a, b) => a + b, 0);

  // By staff 
  const byStaffStats = await appts.aggregate([
    ...pipeline,
    { $group: { _id: { staffRef: "$staffRef", status: "$status" }, count: { $sum: 1 } } },
    { $group: { _id: "$_id.staffRef", total: { $sum: "$count" }, statuses: { $push: { status: "$_id.status", count: "$count" } } } },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, staffId: "$_id", staffName: "$user.name", total: 1, statuses: 1 } },
  ]).toArray();

  // Per-staff service mix
  const byStaffServicesAgg = await appts.aggregate([
    ...pipeline,
    { $group: { _id: { staffRef: "$staffRef", serviceRef: "$serviceRef" }, count: { $sum: 1 } } },
    { $lookup: { from: "services", localField: "_id.serviceRef", foreignField: "_id", as: "service" } },
    { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
    { $group: { _id: "$_id.staffRef", services: { $push: { serviceId: "$_id.serviceRef", serviceName: "$service.name", count: "$count" } } } },
    { $project: { _id: 0, staffId: "$_id", services: 1 } },
  ]).toArray();

  const servicesByStaff = new Map(byStaffServicesAgg.map(x => [String(x.staffId), x.services]));
  const byStaff = byStaffStats.map(s => ({
    ...s,
    statuses: Object.fromEntries((s.statuses || []).map(x => [x.status, x.count])),
    services: servicesByStaff.get(String(s.staffId)) || [],
  }));

  // Top services 
  const topServices = await appts.aggregate([
    ...pipeline,
    { $match: { status: { $ne: "cancelled" } } },
    { $group: { _id: "$serviceRef", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $lookup: { from: "services", localField: "_id", foreignField: "_id", as: "service" } },
    { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, serviceId: "$_id", serviceName: "$service.name", count: 1 } },
  ]).toArray();

  // Peaks 
  const peaksAgg = await appts.aggregate([
    ...pipeline,
    { $match: { status: { $ne: "cancelled" } } },
    { $project: { hour: { $hour: "$ts" }, day: { $dayOfWeek: "$ts" } } }, 
    { $facet: {
      hours: [ { $group: { _id: "$hour", count: { $sum: 1 } } }, { $sort: { count: -1 } } ],
      days:  [ { $group: { _id: "$day",  count: { $sum: 1 } } }, { $sort: { count: -1 } } ],
    } },
  ]).toArray();

  const hours = (peaksAgg[0]?.hours || []).map(h => ({ hour: h._id, count: h.count }));
  const days  = (peaksAgg[0]?.days  || []).map(d => ({ day: d._id, count: d.count }));

  return {
    range: { from: from || null, to: to || null },
    totals: {
      total: totals.total || 0,
      booked: totals.booked || 0,
      confirmed: totals.confirmed || 0,
      rescheduled: totals.rescheduled || 0,
      completed: totals.completed || 0,
      cancelled: totals.cancelled || 0,
    },
    byStaff,
    topServices,
    peak: {
      hours, days,
      topHours: hours.slice(0, 3),
      topDays: days.slice(0, 3),
    },
  };
}

/*
   JSON endpoint
*/
export async function appointmentsOverview(req, res) {
  try {
    const data = await buildAppointmentsOverview({
      from: req.query.from,
      to: req.query.to,
      staffId: req.query.staffId,
      serviceId: req.query.serviceId,
    });
    res.json({ success: true, ...data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Failed to build appointment report" });
  }
}


