import mongoose from "mongoose";
import PDFDocument from "pdfkit";

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

/*
  PDF endpoint
 */
export async function appointmentsOverviewPdf(req, res) {
  try {
    const data = await buildAppointmentsOverview({
      from: req.query.from,
      to: req.query.to,
      staffId: req.query.staffId,
      serviceId: req.query.serviceId,
    });

    const fromStr = data.range.from ? new Date(data.range.from).toISOString().slice(0,10) : "all";
    const toStr   = data.range.to   ? new Date(data.range.to).toISOString().slice(0,10)   : "all";
    const filename = `appointment_report_${fromStr}_to_${toStr}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    doc.pipe(res);

    const H1 = 18, H2 = 14, TEXT = 10, GAP = 10;
    function heading(txt, size = H2) { doc.moveDown(0.6).fontSize(size).fillColor("#111").text(txt); doc.moveDown(0.2); }
    function para(txt) { doc.fontSize(TEXT).fillColor("#333").text(txt); }
    function line() { doc.moveDown(0.3).strokeColor("#f3a4c7").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke(); }

    // Title
    doc.fontSize(H1).fillColor("#111").text("Pink Aura — Appointment Report", { align: "left" });
    doc.moveDown(0.3);
    para(`Range: ${fromStr} → ${toStr}`);
    line();

    // Totals 
    heading("Overview");
    const t = data.totals;
    const cols = [
      ["Total", t.total], ["Booked", t.booked], ["Confirmed", t.confirmed],
      ["Rescheduled", t.rescheduled], ["Completed", t.completed], ["Cancelled", t.cancelled],
    ];
    const colW = 255; const startX = 40; let x = startX; let y = doc.y + 4; let rowH = 16;
    doc.fontSize(TEXT).fillColor("#000");
    cols.forEach(([k,v], idx) => {
      doc.rect(x, y, colW, rowH).strokeColor("#f2c6db").lineWidth(0.5).stroke();
      doc.text(`${k}: ${v}`, x + 6, y + 4);
      if (idx % 2 === 1) { y += rowH; x = startX; } else { x += colW + 10; }
    });
    doc.moveDown(1.2);

    // Top services
    heading("Most-Booked Services");
    if (!data.topServices.length) {
      para("No data.");
    } else {
      doc.fontSize(TEXT);
      const header = ["Service", "Count"];
      const rows = data.topServices.map(s => [s.serviceName || String(s.serviceId), String(s.count)]);
      drawTable(doc, header, rows);
    }

    // Peaks
    heading("Peak Hours / Days");
    const hoursStr = (data.peak.topHours || []).map(h => `${h.hour}:00 (${h.count})`).join("  ·  ") || "—";
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const daysStr  = (data.peak.topDays || []).map(d => `${dayNames[d.day % 7]} (${d.count})`).join("  ·  ") || "—";
    para(`Top Hours: ${hoursStr}`);
    para(`Top Days: ${daysStr}`);

    // By Staff
    heading("Appointments by Staff");
    if (!data.byStaff.length) {
      para("No data.");
    } else {
      const header = ["Staff", "Total", "Booked", "Conf.", "Resch.", "Compl.", "Canc.", "Top Services"];
      const rows = data.byStaff.map(s => {
        const st = s.statuses || {};
        const top = (s.services || []).slice().sort((a,b) => b.count - a.count).slice(0,3)
          .map(x => `${(x.serviceName || "").slice(0,16)} (${x.count})`).join(", ");
        return [
          (s.staffName || String(s.staffId)).slice(0,18),
          String(s.total || 0),
          String(st.booked || 0),
          String(st.confirmed || 0),
          String(st.rescheduled || 0),
          String(st.completed || 0),
          String(st.cancelled || 0),
          top || "—",
        ];
      });
      drawTable(doc, header, rows, { colWidths: [90, 35, 35, 35, 35, 35, 35, 150] });
    }

    doc.moveDown(1.2);
    line();
    para("Generated by Pink Aura Admin • " + new Date().toLocaleString());
    doc.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Failed to export PDF" });
  }
}


function drawTable(doc, header, rows, opts = {}) {
  const startX = 40;
  let y = doc.y + 6;
  const colCount = header.length;
  const totalWidth = 515; // A4 width - margins
  let colWidths = opts.colWidths || Array(colCount).fill(Math.floor(totalWidth / colCount));
  if (colWidths.reduce((a,b)=>a+b,0) > totalWidth) {
    
    const sum = colWidths.reduce((a,b)=>a+b,0);
    colWidths = colWidths.map(w => Math.floor((w/sum) * totalWidth));
  }

  const rowH = 18;
  const cellPad = 4;

  // header
  doc.fontSize(10).fillColor("#111").font("Helvetica-Bold");
  let x = startX;
  header.forEach((h, i) => {
    doc.rect(x, y, colWidths[i], rowH).fillAndStroke("#fde6ef", "#f2c6db");
    doc.fillColor("#111").text(h, x + cellPad, y + 4, { width: colWidths[i] - cellPad*2 });
    x += colWidths[i];
  });

  // rows
  doc.font("Helvetica").fillColor("#222");
  y += rowH;
  rows.forEach(r => {
    if (y + rowH > 780) { 
      doc.addPage(); y = 40;
    }
    let x2 = startX;
    r.forEach((c, i) => {
      doc.rect(x2, y, colWidths[i], rowH).strokeColor("#f2c6db").lineWidth(0.5).stroke();
      doc.text(String(c), x2 + cellPad, y + 4, { width: colWidths[i] - cellPad*2 });
      x2 += colWidths[i];
    });
    y += rowH;
  });
  doc.moveDown(1);
}
