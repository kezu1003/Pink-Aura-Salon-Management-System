import Product from "../models/Product.js";
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

//PDF helpers
function fmtMoney(v) {
  if (v === undefined || v === null || Number.isNaN(Number(v))) return "-";
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(Number(v));
}
function fmtDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
}

// Draw a paginated table PDF and stream to response
function streamPDF(res, title, columns, rows) {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${title.replace(/[^a-z0-9_-]+/gi, "_")}.pdf"`);

  doc.pipe(res);

  // Title + generated time
  doc.fontSize(18).fillColor("#2C3E50").text(title, { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(9).fillColor("#7F8C8D").text(`Generated on ${new Date().toLocaleString()}`, { align: "center" });
  doc.moveDown();

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const startX = doc.page.margins.left;
  let y = doc.y;

  // simple flexible widths: first column a bit wider
  const colCount = columns.length;
  const base = pageWidth / colCount;
  const widths = columns.map((_, i) => (i === 0 ? base * 1.4 : (pageWidth - base * 1.4) / (colCount - 1)));

  function drawHeader() {
    doc.save();
    doc.rect(startX, y, pageWidth, 20).fill("#E8F6F3");
    doc.fillColor("#16A085").fontSize(11).font("Helvetica-Bold");
    let x = startX + 6;
    columns.forEach((c, i) => {
      doc.text(c.label, x, y + 6, { width: widths[i] - 12, ellipsis: true });
      x += widths[i];
    });
    y += 20;
    doc.restore();
  }

  function footer() {
    const bottom = doc.page.height - doc.page.margins.bottom + 10;
    doc.fontSize(9).fillColor("#7F8C8D");
    doc.text(`Page ${doc.page.number}`, doc.page.margins.left, bottom, {
      width: pageWidth,
      align: "right",
    });
  }

  drawHeader();
  doc.font("Helvetica").fontSize(10).fillColor("black");

  rows.forEach((row, idx) => {
    const display = columns.map((c) => {
      const val = row[c.key];
      if (/price|value/i.test(c.key)) return fmtMoney(val);
      if (/date/i.test(c.key)) return fmtDate(val);
      return val === null || val === undefined || val === "" ? "-" : String(val);
    });

    // measure to compute row height
    let maxH = 0;
    display.forEach((cell, i) => {
      const h = doc.heightOfString(cell, { width: widths[i] - 12, align: "left" });
      maxH = Math.max(maxH, h);
    });
    const rowH = Math.max(18, maxH + 8);

    // page break if needed
    const bottomLimit = doc.page.height - doc.page.margins.bottom - 30;
    if (y + rowH > bottomLimit) {
      footer();
      doc.addPage();
      y = doc.page.margins.top;
      drawHeader();
    }

    // zebra background
    if (idx % 2 === 1) {
      doc.save();
      doc.rect(startX, y, pageWidth, rowH).fill("#FAFAFA");
      doc.restore();
    }

    // draw cells
    let x = startX + 6;
    display.forEach((cell, i) => {
      doc.fillColor("black").font("Helvetica").text(cell, x, y + 4, {
        width: widths[i] - 12,
        align: "left",
      });
      x += widths[i];
    });

    // row border
    doc.save();
    doc.lineWidth(0.3).strokeColor("#E0E0E0").moveTo(startX, y + rowH).lineTo(startX + pageWidth, y + rowH).stroke();
    doc.restore();

    y += rowH;
  });

  footer();
  doc.end();
}

//  Controller 
export const generateProductReport = async (req, res) => {
  try {
    const {
      type = "summary",
      format = "json",
      lowThreshold: rawLow,
      expiryDays: rawExpiry,
      category,
      brand,
      minPrice: rawMinPrice,
      maxPrice: rawMaxPrice,
      q,
    } = req.query;

    const lowThreshold = Number.isFinite(Number(rawLow)) ? Number(rawLow) : 5;
    const expiryDays = Number.isFinite(Number(rawExpiry)) ? Number(rawExpiry) : 30;
    const minPrice = Number.isFinite(Number(rawMinPrice)) ? Number(rawMinPrice) : undefined;
    const maxPrice = Number.isFinite(Number(rawMaxPrice)) ? Number(rawMaxPrice) : undefined;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (q) filter.name = { $regex: q, $options: "i" };
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    // LOW-STOCK
    if (type === "low-stock") {
      const products = await Product.find({ ...filter, stock: { $lte: lowThreshold } }).sort({ stock: 1, name: 1 });
      const payload = products.map((p) => ({
        id: p._id,
        name: p.name,
        category: p.category,
        brand: p.brand,
        price: p.price,
        stock: p.stock,
        expiryDate: p.expiryDate ? p.expiryDate.toISOString() : null,
        expiryDaysLeft: p.expiryDate ? Math.ceil((p.expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : null,
      }));

      const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "category", label: "Category" },
        { key: "brand", label: "Brand" },
        { key: "price", label: "Price" },
        { key: "stock", label: "Stock" },
        { key: "expiryDate", label: "Expiry Date" },
        { key: "expiryDaysLeft", label: "Days To Expiry" },
      ];

      if (format === "csv") {
        const csv = toCSV(payload, columns);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="products-low-stock.csv"`);
        return res.send(csv);
      }
      if (format === "pdf") {
        return streamPDF(res, "Low Stock Products", columns, payload);
      }

      return res.json({ success: true, type: "low-stock", threshold: lowThreshold, total: payload.length, products: payload });
    }

    // EXPIRY
    if (type === "expiry") {
      const now = new Date();
      const until = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);
      const products = await Product.find({
        ...filter,
        expiryDate: { $exists: true, $ne: null, $gte: now, $lte: until },
      }).sort({ expiryDate: 1 });

      const payload = products.map((p) => ({
        id: p._id,
        name: p.name,
        category: p.category,
        brand: p.brand,
        price: p.price,
        stock: p.stock,
        expiryDate: p.expiryDate ? p.expiryDate.toISOString() : null,
        expiryDaysLeft: p.expiryDate ? Math.ceil((p.expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : null,
      }));

      const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "category", label: "Category" },
        { key: "brand", label: "Brand" },
        { key: "price", label: "Price" },
        { key: "stock", label: "Stock" },
        { key: "expiryDate", label: "Expiry Date" },
        { key: "expiryDaysLeft", label: "Days To Expiry" },
      ];

      if (format === "csv") {
        const csv = toCSV(payload, columns);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="products-expiry-${expiryDays}d.csv"`);
        return res.send(csv);
      }
      if (format === "pdf") {
        return streamPDF(res, `Expiring Within ${expiryDays} Days`, columns, payload);
      }

      return res.json({ success: true, type: "expiry", expiryDays, total: payload.length, products: payload });
    }

    // INVENTORY
    if (type === "inventory") {
      const products = await Product.find(filter).sort({ category: 1, name: 1 });
      const payload = products.map((p) => ({
        id: p._id,
        name: p.name,
        category: p.category,
        brand: p.brand,
        price: p.price,
        stock: p.stock,
        stockValue: Number((p.price || 0) * (p.stock || 0)),
        expiryDate: p.expiryDate ? p.expiryDate.toISOString() : null,
      }));

      const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "category", label: "Category" },
        { key: "brand", label: "Brand" },
        { key: "price", label: "Price" },
        { key: "stock", label: "Stock" },
        { key: "stockValue", label: "Stock Value" },
        { key: "expiryDate", label: "Expiry Date" },
      ];

      if (format === "csv") {
        const csv = toCSV(payload, columns);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="products-inventory.csv"`);
        return res.send(csv);
      }
      if (format === "pdf") {
        return streamPDF(res, "Full Inventory", columns, payload);
      }

      return res.json({ success: true, type: "inventory", total: payload.length, products: payload });
    }

    // SUMMARY (default)
    const [totals, byCategory, byBrand] = await Promise.all([
      Product.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStockUnits: { $sum: "$stock" },
            totalInventoryValue: { $sum: { $multiply: ["$price", "$stock"] } },
            avgPrice: { $avg: "$price" },
          },
        },
      ]),
      Product.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            stockUnits: { $sum: "$stock" },
            inventoryValue: { $sum: { $multiply: ["$price", "$stock"] } },
          },
        },
      ]),
      Product.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$brand",
            count: { $sum: 1 },
            stockUnits: { $sum: "$stock" },
            inventoryValue: { $sum: { $multiply: ["$price", "$stock"] } },
          },
        },
        { $sort: { inventoryValue: -1 } },
        { $limit: 20 },
      ]),
    ]);

    const summary = totals[0] || {
      totalProducts: 0,
      totalStockUnits: 0,
      totalInventoryValue: 0,
      avgPrice: 0,
    };

    const formatted = {
      totalProducts: summary.totalProducts,
      totalStockUnits: summary.totalStockUnits,
      totalInventoryValue: Number(summary.totalInventoryValue || 0),
      avgPrice: Number(summary.avgPrice || 0),
      byCategory: byCategory.map((c) => ({
        category: c._id,
        count: c.count,
        stockUnits: c.stockUnits,
        inventoryValue: Number(c.inventoryValue || 0),
      })),
      topBrands: byBrand.map((b) => ({
        brand: b._id || "Unknown",
        count: b.count,
        stockUnits: b.stockUnits,
        inventoryValue: Number(b.inventoryValue || 0),
      })),
    };

    if (format === "csv") {
      const lines = [];
      lines.push(`"Metric","Value"`);
      lines.push(`"Total Products","${formatted.totalProducts}"`);
      lines.push(`"Total Stock Units","${formatted.totalStockUnits}"`);
      lines.push(`"Total Inventory Value","${formatted.totalInventoryValue}"`);
      lines.push(`"Average Price","${formatted.avgPrice}"`);
      lines.push("");
      lines.push(`"Category","Count","StockUnits","InventoryValue"`);
      formatted.byCategory.forEach((c) => {
        lines.push(`"${c.category}","${c.count}","${c.stockUnits}","${c.inventoryValue}"`);
      });
      lines.push("");
      lines.push(`"Top Brand","Count","StockUnits","InventoryValue"`);
      formatted.topBrands.forEach((b) => {
        lines.push(`"${b.brand}","${b.count}","${b.stockUnits}","${b.inventoryValue}"`);
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="products-summary.csv"`);
      return res.send(lines.join("\r\n"));
    }

    if (format === "pdf") {
      const cols = [
        { key: "metric", label: "Metric" },
        { key: "value", label: "Value" },
      ];
      const rows = [
        { metric: "Total Products", value: formatted.totalProducts },
        { metric: "Total Stock Units", value: formatted.totalStockUnits },
        { metric: "Total Inventory Value", value: formatted.totalInventoryValue },
        { metric: "Average Price", value: formatted.avgPrice },
      ];
      return streamPDF(res, "Summary Report", cols, rows);
    }

    return res.json({ success: true, type: "summary", report: formatted });
  } catch (err) {
    console.error("generateProductReport error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
