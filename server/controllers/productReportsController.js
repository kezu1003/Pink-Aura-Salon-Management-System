import Product from "../models/Product.js";
import mongoose from "mongoose";
import PDFDocument from "pdfkit"; // added for PDF support

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
