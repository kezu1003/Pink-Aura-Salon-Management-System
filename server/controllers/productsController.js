import mongoose from "mongoose";
import Product from "../models/Product.js";



function computeExpiryDaysLeft(expiryDate) {
  if (!expiryDate) return null;
  const today = new Date();
  const diffMs = new Date(expiryDate).getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function withComputedFields(doc) {
 
  const obj = typeof doc.toObject === "function" ? doc.toObject() : doc;
  obj.expiryDaysLeft = computeExpiryDaysLeft(obj.expiryDate);
  return obj;
}

function parseNumber(value, fallback = undefined) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isNaN(n) ? fallback : n;
}

const ALLOWED_SORTS = new Set(["createdAt", "price", "stock", "name"]);




export const getProducts = async (req, res) => {
  try {
    // 1) Fast-path: fetch by explicit IDs (e.g., cart stock refresh)
    if (req.query.ids) {
      const ids = req.query.ids
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      
      const validIds = ids.filter((id) => mongoose.isValidObjectId(id));

      const products = await Product.find({
        _id: { $in: validIds },
        isActive: true,
      });

      const payload = products.map(withComputedFields);
      return res.json({ success: true, products: payload, total: payload.length });
    }

    
    const {
      category,
      q,
      minPrice,
      maxPrice,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (q) query.name = { $regex: q, $options: "i" };

    const minP = parseNumber(minPrice);
    const maxP = parseNumber(maxPrice);
    if (minP !== undefined || maxP !== undefined) {
      query.price = {};
      if (minP !== undefined) query.price.$gte = minP;
      if (maxP !== undefined) query.price.$lte = maxP;
    }

    const sortKey = ALLOWED_SORTS.has(sort) ? sort : "createdAt";
    const sortDir = order === "asc" ? 1 : -1;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 12);

    const [products, count] = await Promise.all([
      Product.find(query)
        .sort({ [sortKey]: sortDir })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    const payload = products.map(withComputedFields);

    res.json({ success: true, products: payload, total: count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    const payload = withComputedFields(product);
    res.json({ success: true, product: payload });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE (Admin)
export const createProduct = async (req, res) => {
  try {
    const body = { ...req.body };

    // Normalize numeric fields
    if (body.price !== undefined) body.price = Number(body.price);
    if (body.stock !== undefined) body.stock = Number(body.stock);

    const product = new Product({ ...body, createdBy: req.user?.id });
    await product.save();

    const payload = withComputedFields(product);
    res.json({ success: true, product: payload });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// UPDATE (Admin)
export const updateProduct = async (req, res) => {
  try {
    const body = { ...req.body };

    if (body.price !== undefined) body.price = Number(body.price);
    if (body.stock !== undefined) body.stock = Number(body.stock);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...body, updatedBy: req.user?.id },
      { new: true }
    );
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    const payload = withComputedFields(product);
    res.json({ success: true, product: payload });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedBy: req.user?.id },
      { new: true }
    );
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deactivated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE stock (Admin) — safe (won't go below zero)
export const adjustStock = async (req, res) => {
  try {
    const change = Number(req.body?.change || 0);
    if (!Number.isFinite(change) || change === 0) {
      return res.status(400).json({ success: false, message: "Invalid stock change" });
    }

    // Prevent negative stock: require stock >= -change if change is negative
    const filter =
      change < 0
        ? { _id: req.params.id, stock: { $gte: Math.abs(change) } }
        : { _id: req.params.id };

    const product = await Product.findOneAndUpdate(
      filter,
      { $inc: { stock: change }, updatedBy: req.user?.id },
      { new: true }
    );

    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough stock to apply decrement or product not found" });
    }

    const payload = withComputedFields(product);
    res.json({ success: true, product: payload });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
