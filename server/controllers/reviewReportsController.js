import Review from "../models/Review.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";

function toCSV(rows = [], columns = []) {
  const header = columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(",");
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key] === undefined || row[c.key] === null ? "" : String(row[c.key]);
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  return [header, ...lines].join("\r\n");
}

// helper: build PDF
function streamPDF(res, title, columns, rows) {
  const doc = new PDFDocument({ margin: 40, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${title}.pdf"`);
  doc.pipe(res);

  // header
  doc.fontSize(18).fillColor("#2C3E50").text(title, { align: "center" });
  doc.moveDown();

  // table header
  doc.fontSize(12).fillColor("#16A085");
  columns.forEach((c, i) => {
    doc.text(c.label, 50 + i * 100, doc.y, { continued: i < columns.length - 1 });
  });
  doc.moveDown(0.5);

  // rows
  doc.fillColor("black").fontSize(10);
  rows.forEach((row) => {
    columns.forEach((c, i) => {
      doc.text(row[c.key] ?? "-", 50 + i * 100, doc.y, { continued: i < columns.length - 1 });
    });
    doc.moveDown(0.5);
  });

  // footer
  doc.moveDown(2);
  doc.fontSize(9).fillColor("#7F8C8D").text(`Generated on ${new Date().toLocaleString()}`, { align: "center" });

  doc.end();
}

export const generateReviewReport = async (req, res) => {
  try {
    const {
      type = "summary",
      format = "json",
      monthly,
      category,
      staffId,
      q,
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (staffId && mongoose.isValidObjectId(staffId)) filter.staff = staffId;
    if (q) filter.comment = { $regex: q, $options: "i" };
    
    // Monthly filtering
    if (monthly) {
      const [year, month] = monthly.split('-');
      if (year && month) {
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
        filter.createdAt = {
          $gte: startDate,
          $lte: endDate
        };
      }
    }

    // DETAILED REVIEWS
    if (type === "detailed") {
      const reviews = await Review.find(filter)
        .populate([{ path: "user", select: "name" }, { path: "staff", select: "name" }])
        .sort({ createdAt: -1 });

      const payload = reviews.map((review) => ({
        id: review._id,
        userName: review.user?.name || 'Unknown',
        staffName: review.staff?.name || 'Unknown',
        category: review.category,
        rating: review.rating,
        comment: review.comment || '',
        createdAt: review.createdAt?.toISOString() || '',
      }));

      const columns = [
        { key: "id", label: "ID" },
        { key: "userName", label: "User" },
        { key: "staffName", label: "Staff" },
        { key: "category", label: "Category" },
        { key: "rating", label: "Rating" },
        { key: "comment", label: "Comment" },
        { key: "createdAt", label: "Date" },
      ];

      if (format === "csv") {
        const csv = toCSV(payload, columns);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="reviews-detailed.csv"`);
        return res.send(csv);
      }
      if (format === "pdf") {
        return streamPDF(res, "Detailed Reviews", columns, payload);
      }

      return res.json({ success: true, type: "detailed", total: payload.length, reviews: payload });
    }

    // STAFF PERFORMANCE
    if (type === "staff") {
      const staffPerformance = await Review.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$staff",
            reviewCount: { $sum: 1 },
            averageRating: { $avg: "$rating" },
            totalRating: { $sum: "$rating" }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "staffInfo"
          }
        },
        { $unwind: "$staffInfo" },
        { $sort: { averageRating: -1, reviewCount: -1 } }
      ]);

      const payload = staffPerformance.map((staff) => ({
        staffId: staff._id,
        staffName: staff.staffInfo.name || 'Unknown',
        reviewCount: staff.reviewCount,
        averageRating: Number(staff.averageRating.toFixed(1)),
        totalRating: staff.totalRating
      }));

      const columns = [
        { key: "staffName", label: "Staff Name" },
        { key: "reviewCount", label: "Review Count" },
        { key: "averageRating", label: "Average Rating" },
        { key: "totalRating", label: "Total Rating" },
      ];

      if (format === "csv") {
        const csv = toCSV(payload, columns);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="reviews-staff-performance.csv"`);
        return res.send(csv);
      }
      if (format === "pdf") {
        return streamPDF(res, "Staff Performance", columns, payload);
      }

      return res.json({ success: true, type: "staff", total: payload.length, staff: payload });
    }

    // CATEGORY ANALYSIS
    if (type === "category") {
      const categoryAnalysis = await Review.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$category",
            reviewCount: { $sum: 1 },
            averageRating: { $avg: "$rating" },
            totalRating: { $sum: "$rating" }
          }
        },
        { $sort: { averageRating: -1, reviewCount: -1 } }
      ]);

      const payload = categoryAnalysis.map((category) => ({
        category: category._id,
        reviewCount: category.reviewCount,
        averageRating: Number(category.averageRating.toFixed(1)),
        totalRating: category.totalRating
      }));

      const columns = [
        { key: "category", label: "Category" },
        { key: "reviewCount", label: "Review Count" },
        { key: "averageRating", label: "Average Rating" },
        { key: "totalRating", label: "Total Rating" },
      ];

      if (format === "csv") {
        const csv = toCSV(payload, columns);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="reviews-category-analysis.csv"`);
        return res.send(csv);
      }
      if (format === "pdf") {
        return streamPDF(res, "Category Analysis", columns, payload);
      }

      return res.json({ success: true, type: "category", total: payload.length, categories: payload });
    }

    // SUMMARY (default)
    const [totals, byCategory, topStaff] = await Promise.all([
      Review.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: "$rating" },
            fiveStarCount: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
            oneStarCount: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
          },
        },
      ]),
      Review.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            averageRating: { $avg: "$rating" },
          },
        },
        { $sort: { count: -1 } }
      ]),
      Review.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$staff",
            reviewCount: { $sum: 1 },
            averageRating: { $avg: "$rating" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "staffInfo"
          }
        },
        { $unwind: "$staffInfo" },
        { $sort: { averageRating: -1, reviewCount: -1 } },
        { $limit: 10 }
      ])
    ]);

    const summary = totals[0] || {
      totalReviews: 0,
      averageRating: 0,
      fiveStarCount: 0,
      oneStarCount: 0,
    };

    const formatted = {
      totalReviews: summary.totalReviews,
      averageRating: Number(summary.averageRating || 0),
      fiveStarCount: summary.fiveStarCount,
      oneStarCount: summary.oneStarCount,
      satisfactionRate: summary.totalReviews > 0 ? Number(((summary.fiveStarCount / summary.totalReviews) * 100).toFixed(1)) : 0,
      byCategory: byCategory.map((c) => ({
        category: c._id,
        count: c.count,
        averageRating: Number(c.averageRating.toFixed(1)),
      })),
      topStaff: topStaff.map((s) => ({
        staffId: s._id,
        staffName: s.staffInfo.name || 'Unknown',
        reviewCount: s.reviewCount,
        averageRating: Number(s.averageRating.toFixed(1)),
      })),
    };

    if (format === "csv") {
      const lines = [];
      lines.push(`"Metric","Value"`);
      lines.push(`"Total Reviews","${formatted.totalReviews}"`);
      lines.push(`"Average Rating","${formatted.averageRating}"`);
      lines.push(`"5-Star Reviews","${formatted.fiveStarCount}"`);
      lines.push(`"1-Star Reviews","${formatted.oneStarCount}"`);
      lines.push(`"Satisfaction Rate","${formatted.satisfactionRate}%"`);
      lines.push("");
      lines.push(`"Category","Count","Average Rating"`);
      formatted.byCategory.forEach((c) => {
        lines.push(`"${c.category}","${c.count}","${c.averageRating}"`);
      });
      lines.push("");
      lines.push(`"Staff","Review Count","Average Rating"`);
      formatted.topStaff.forEach((s) => {
        lines.push(`"${s.staffName}","${s.reviewCount}","${s.averageRating}"`);
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="reviews-summary.csv"`);
      return res.send(lines.join("\r\n"));
    }
    if (format === "pdf") {
      const cols = [
        { key: "metric", label: "Metric" },
        { key: "value", label: "Value" },
      ];
      const rows = [
        { metric: "Total Reviews", value: formatted.totalReviews },
        { metric: "Average Rating", value: formatted.averageRating },
        { metric: "5-Star Reviews", value: formatted.fiveStarCount },
        { metric: "1-Star Reviews", value: formatted.oneStarCount },
        { metric: "Satisfaction Rate", value: `${formatted.satisfactionRate}%` },
      ];
      return streamPDF(res, "Review Summary Report", cols, rows);
    }

    return res.json({ success: true, type: "summary", report: formatted });
  } catch (err) {
    console.error("generateReviewReport error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
