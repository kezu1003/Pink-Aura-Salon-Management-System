import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import Appointment from "../models/Appointment.js";
import Service from "../models/Service.js";
import Package from "../models/Package.js";

// ---------- Utilities ----------
function monthRangeUTC(year, month) {
  const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const to = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  return { from, to };
}
function currency(v) {
  if (v == null) return "Rs.0";
  try { return `Rs.${Number(v).toLocaleString()}`; } catch { return `Rs.${v}`; }
}
function effectivePackagePrice(pkg) {
  if (!pkg) return 0;
  const dp = Number(pkg.discountPrice ?? 0);
  const p  = Number(pkg.price ?? 0);
  return (pkg.discountPrice != null && dp < p) ? dp : p;
}

// PDF helpers
function addHeader(doc, title, subtitle) {
  doc.fontSize(18).fillColor("#111").text(title, { align: "left" });
  if (subtitle) doc.fontSize(10).fillColor("#555").text(subtitle, { align: "left" });
  doc.moveDown(0.5);
  doc.strokeColor("#F472B6").lineWidth(1).moveTo(doc.x, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();
}
function kpi(doc, label, value, x, y, w = 160, h = 60) {
  doc.roundedRect(x, y, w, h, 10).lineWidth(0.5).fillAndStroke("#fff", "#e5e7eb");
  doc.fillColor("#6b7280").fontSize(9).text(label, x + 12, y + 10, { width: w - 24, align: "left" });
  doc.fillColor("#111827").fontSize(16).text(value, x + 12, y + 26, { width: w - 24 });
}
function drawBarChart(doc, { x, y, w, h, title, labels, values }) {
  const topPad = 24, leftPad = 40, bottomPad = 20, rightPad = 10;
  doc.fontSize(11).fillColor("#111").text(title, x, y - 2);
  const plotX = x + leftPad, plotY = y + topPad, plotW = w - leftPad - rightPad, plotH = h - topPad - bottomPad;
  doc.rect(plotX, plotY, plotW, plotH).strokeColor("#e5e7eb").stroke();
  if (!values || values.length === 0) { doc.fontSize(9).fillColor("#6b7280").text("No data", plotX + 8, plotY + 8); return; }
  const maxV = Math.max(...values, 1), barGap = 12;
  const barW = Math.max(10, (plotW - barGap * (values.length + 1)) / values.length);
  values.forEach((v, i) => {
    const barH = Math.round((v / maxV) * (plotH - 18));
    const bx = plotX + barGap + i * (barW + barGap);
    const by = plotY + plotH - barH - 1;
    doc.roundedRect(bx, by, barW, barH, 3).fillColor("#F472B6").fill();
    const lbl = String(labels[i] ?? "").slice(0, 12);
    doc.fontSize(8).fillColor("#374151").text(lbl, bx - 6, plotY + plotH + 2, { width: barW + 12, align: "center" });
  });
  const tickVals = [0, Math.round(maxV / 2), maxV];
  tickVals.forEach((tv) => {
    const ty = plotY + plotH - Math.round((tv / maxV) * (plotH - 18));
    doc.strokeColor("#f3f4f6").moveTo(plotX, ty).lineTo(plotX + plotW, ty).stroke();
    doc.fontSize(7).fillColor("#6b7280").text(String(tv), x, ty - 3, { width: leftPad - 6, align: "right" });
  });
}
function drawTable(doc, startX, startY, columns, rows, maxRows = 12) {
  const rowH = 18, headerH = 20;
  doc.fillColor("#111").fontSize(9);
  columns.forEach((c, idx) => {
    const x = startX + columns.slice(0, idx).reduce((a, b) => a + b.width, 0);
    doc.text(c.label, x + 4, startY, { width: c.width - 8 });
  });
  doc.strokeColor("#e5e7eb").moveTo(startX, startY + headerH)
    .lineTo(startX + columns.reduce((a, b) => a + b.width, 0), startY + headerH).stroke();
  doc.fontSize(8).fillColor("#111");
  rows.slice(0, maxRows).forEach((r, ridx) => {
    const y = startY + headerH + ridx * rowH + 3;
    columns.forEach((c, idx) => {
      const x = startX + columns.slice(0, idx).reduce((a, b) => a + b.width, 0);
      let val = r[c.key];
      if (typeof val === "number" && /revenue|price/i.test(c.key)) val = currency(val);
      doc.text(val ?? "", x + 4, y, { width: c.width - 8 });
    });
  });
}


async function buildMonthlyData({ year, month, statusCsv = "completed,confirmed" }) {
  const { from, to } = monthRangeUTC(Number(year), Number(month));
  const statuses = statusCsv.split(",").map((s) => s.trim().toLowerCase());
  const matchBase = { startTime: { $gte: from, $lt: to }, status: { $in: statuses } };

  const [servicesList, packagesList] = await Promise.all([
    Service.find({}).select("_id name category price").lean(),
    Package.find({}).select("_id name category price discountPrice").lean(),
  ]);
  const svcMap = new Map(servicesList.map((s) => [String(s._id), s]));
  const pkgNameMap = new Map(packagesList.map((p) => [String(p.name).toLowerCase(), p]));

  const monthAppts = await Appointment.find(matchBase)
    .select("customer services startTime endTime status notes")
    .lean();

  const totalAppointments = monthAppts.length;
  const completedCount = monthAppts.filter((a) => a.status === "completed").length;
  const cancelledCount = monthAppts.filter((a) => a.status === "cancelled").length;
  const confirmedCount = monthAppts.filter((a) => a.status === "confirmed").length;

  // Service breakdown
  const serviceCountMap = new Map();
  for (const a of monthAppts) {
    for (const sid of a.services || []) {
      const key = String(sid);
      const s = svcMap.get(key);
      if (!s) continue;
      const entry = serviceCountMap.get(key) || {
        serviceId: key, name: s.name, category: s.category, price: Number(s.price || 0), count: 0, estRevenue: 0,
      };
      entry.count += 1;
      entry.estRevenue += Number(s.price || 0);
      serviceCountMap.set(key, entry);
    }
  }
  const byService = Array.from(serviceCountMap.values()).sort((a, b) => b.count - a.count);
  const byServiceCategoryMap = new Map();
  byService.forEach((r) => {
    const key = r.category || "Other";
    const v = byServiceCategoryMap.get(key) || { category: key, count: 0, estRevenue: 0 };
    v.count += r.count; v.estRevenue += r.estRevenue; byServiceCategoryMap.set(key, v);
  });
  const byServiceCategory = Array.from(byServiceCategoryMap.values()).sort((a, b) => b.count - a.count);

  // Package breakdown 

  const pkgCountMap = new Map();
  const packageNoteRegex = /^Booked package:\s*(.+)$/i;
  for (const a of monthAppts) {
    const m = (a.notes || "").match(packageNoteRegex);
    if (!m) continue;
    const pkgName = m[1].trim();
    const p = pkgNameMap.get(pkgName.toLowerCase()) || null;
    const eff = effectivePackagePrice(p);
    const key = p ? String(p._id) : pkgName.toLowerCase();
    const entry = pkgCountMap.get(key) || {
      packageId: p ? String(p._id) : null, name: pkgName, category: p?.category || "Other",
      price: eff, count: 0, estRevenue: 0,
    };
    entry.count += 1;
    entry.estRevenue += eff;
    pkgCountMap.set(key, entry);
  }
  const byPackage = Array.from(pkgCountMap.values()).sort((a, b) => b.count - a.count);
  const byPackageCategoryMap = new Map();
  byPackage.forEach((r) => {
    const key = r.category || "Other";
    const v = byPackageCategoryMap.get(key) || { category: key, count: 0, estRevenue: 0 };
    v.count += r.count; v.estRevenue += r.estRevenue; byPackageCategoryMap.set(key, v);
  });
  const byPackageCategory = Array.from(byPackageCategoryMap.values()).sort((a, b) => b.count - a.count);

  // New vs returning customers
  const uniqueCustomerIds = Array.from(new Set(monthAppts.map((a) => String(a.customer))));
  const customerObjectIds = uniqueCustomerIds.map((id) => new mongoose.Types.ObjectId(id));
  const firsts = await Appointment.aggregate([
    { $match: { customer: { $in: customerObjectIds } } },
    { $group: { _id: "$customer", first: { $min: "$startTime" } } },
  ]);
  let newCustomers = 0;
  for (const f of firsts) { if (f.first >= from && f.first < to) newCustomers += 1; }
  const returningCustomers = uniqueCustomerIds.length - newCustomers;

  // Preferences by unique customers (service)
  const byServiceUnique = await Appointment.aggregate([
    { $match: matchBase },
    { $unwind: "$services" },
    { $group: { _id: { service: "$services", customer: "$customer" } } },
    { $group: { _id: "$_id.service", uniqueCustomers: { $sum: 1 } } },
    { $lookup: { from: "services", localField: "_id", foreignField: "_id", as: "service" } },
    { $unwind: "$service" },
    { $project: { _id: 0, serviceId: "$service._id", name: "$service.name", category: "$service.category", uniqueCustomers: 1 } },
    { $sort: { uniqueCustomers: -1 } },
  ]);

  // Trend (daily)
  const perDay = await Appointment.aggregate([
    { $match: matchBase },
    { $group: { _id: { $dateToString: { date: "$startTime", format: "%Y-%m-%d" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  // Total est revenue 
  let totalEstRevenue = 0;
  for (const a of monthAppts) {
    const m = (a.notes || "").match(packageNoteRegex);
    if (m) {
      const p = pkgNameMap.get(m[1].trim().toLowerCase());
      totalEstRevenue += effectivePackagePrice(p);
    } else {
      let sum = 0;
      for (const sid of a.services || []) { const s = svcMap.get(String(sid)); sum += Number(s?.price || 0); }
      totalEstRevenue += sum;
    }
  }

  return {
    success: true,
    range: { from, to },
    summary: {
      totalAppointments, completed: completedCount, confirmed: confirmedCount, cancelled: cancelledCount,
      uniqueCustomers: uniqueCustomerIds.length, newCustomers, returningCustomers,
      totalEstRevenue,
      serviceRevenue: byService.reduce((a, b) => a + b.estRevenue, 0),
      packageRevenue: byPackage.reduce((a, b) => a + b.estRevenue, 0),
    },
    byService, byServiceCategory,
    byPackage, byPackageCategory,
    preferences: { topServicesByUniqueCustomers: byServiceUnique.slice(0, 10) },
    trend: perDay.map((d) => ({ date: d._id, count: d.count })),
  };
}

// ---------- JSON ----------
export async function monthlyServiceReport(req, res) {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    const status = req.query.status || "completed,confirmed";
    if (!year || !month || month < 1 || month > 12) {
      return res.json({ success: false, message: "Provide valid year & month (1–12)" });
    }
    const result = await buildMonthlyData({ year, month, statusCsv: status });
    res.json(result);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

// ---------- PDF ----------

export async function monthlyServiceReportPdf(req, res) {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    const status = req.query.status || "completed,confirmed";
    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: "Provide valid year & month (1–12)" });
    }

    const data = await buildMonthlyData({ year, month, statusCsv: status });

    const doc = new PDFDocument({ size: "A4", margin: 36 });
    const fileName = `Service_Monthly_Report_${year}-${String(month).padStart(2, "0")}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    doc.pipe(res);

    addHeader(doc, "Pink Aura — Monthly Service & Package Report",
      `Period: ${year}-${String(month).padStart(2, "0")}  •  Status: ${status}`);

    const y0 = doc.y;
    const s = data.summary;
    kpi(doc, "Total Appointments", String(s.totalAppointments), 36, y0);
    kpi(doc, "Completed", String(s.completed), 206, y0);
    kpi(doc, "Cancelled", String(s.cancelled), 376, y0);
    kpi(doc, "Unique Customers", String(s.uniqueCustomers), 36, y0 + 70);
    kpi(doc, "New Customers", String(s.newCustomers), 206, y0 + 70);
    kpi(doc, "Est. Revenue", currency(s.totalEstRevenue), 376, y0 + 70);

    doc.moveDown(7);

    const topServices = data.byService.slice(0, 5);
    const topPkgs = data.byPackage.slice(0, 5);
    const chartW = 250, chartH = 180, cx1 = 36, cx2 = 320, cy = doc.y;

    drawBarChart(doc, { x: cx1, y: cy, w: chartW, h: chartH,
      title: "Top 5 Services (by bookings)",
      labels: topServices.map((s) => s.name), values: topServices.map((s) => s.count) });

    drawBarChart(doc, { x: cx2, y: cy, w: chartW, h: chartH,
      title: "Top 5 Packages (by bookings)",
      labels: topPkgs.map((p) => p.name), values: topPkgs.map((p) => p.count) });

    doc.moveDown(12);

    addHeader(doc, "Services Breakdown", "Bookings and estimated revenue at list prices.");
    drawTable(doc, 36, doc.y, [
      { key: "name", label: "Service", width: 180 },
      { key: "category", label: "Category", width: 100 },
      { key: "count", label: "Bookings", width: 80 },
      { key: "estRevenue", label: "Est. Revenue", width: 120 },
    ], data.byService);

    doc.addPage();

    addHeader(doc, "Packages Breakdown", "Bookings and revenue at effective package price.");
    drawTable(doc, 36, doc.y, [
      { key: "name", label: "Package", width: 180 },
      { key: "category", label: "Category", width: 100 },
      { key: "count", label: "Bookings", width: 80 },
      { key: "estRevenue", label: "Est. Revenue", width: 120 },
    ], data.byPackage);

    doc.moveDown(2);

    addHeader(doc, "Customer Insights");
    doc.fontSize(10).fillColor("#111");
    doc.text(
      `New vs Returning: ${s.newCustomers} new (${Math.round((s.newCustomers / Math.max(1, s.uniqueCustomers)) * 100)}%), ` +
      `${s.returningCustomers} returning`
    );
    if (data.preferences.topServicesByUniqueCustomers?.length) {
      doc.moveDown(0.5);
      doc.text(
        "Top customer preferences (services): " +
        data.preferences.topServicesByUniqueCustomers.slice(0, 5)
          .map((r) => `${r.name} (${r.uniqueCustomers})`).join(", ")
      );
    }

    addHeader(doc, "Key Trends & Recommendations");
    const cancelRate = s.totalAppointments ? (s.cancelled / s.totalAppointments) * 100 : 0;
    const pkgShare = s.totalAppointments
      ? (data.byPackage.reduce((a, b) => a + b.count, 0) / s.totalAppointments) * 100
      : 0;
    const recs = [];
    if (cancelRate > 15) recs.push("High cancellation rate. Add reminders & flexible rescheduling.");
    else recs.push("Cancellation rate is healthy. Maintain reminder cadence.");
    if (pkgShare < 20 && data.byPackage.length > 0) recs.push("Low package adoption. Promote bundles / limited-time offers.");
    else if (data.byPackage.length > 0) recs.push("Good package adoption. Feature best-seller packages prominently.");
    if (data.byService[0]?.name) recs.push(`Upsell around "${data.byService[0].name}" with add-ons & aftercare.`);
    if (data.byPackage[0]?.name) recs.push(`Showcase results from "${data.byPackage[0].name}" on social media.`);
    if (data.byServiceCategory[0]) recs.push(`Peak interest in ${data.byServiceCategory[0].category}. Align staff schedules.`);

    doc.fontSize(10).fillColor("#111");
    recs.forEach((r) => doc.text(`• ${r}`));

    doc.moveDown(1.5);
    doc.fontSize(8).fillColor("#6b7280").text(
      "Notes: Service revenue sums list prices of booked services. Package revenue uses the effective package price (discounted if set). Total estimated revenue avoids double counting by using package price for package bookings and service sums otherwise."
    );

    doc.end();
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}
