import Product from "../models/Product.js";
import { emitStockUpdate } from "../sockets/io.js";



function buildFilter(query) {
  const { q, category, brand, minPrice, maxPrice, status } = query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (q) {
    filter.$text = { $search: q };
  }
  return filter;
}

function buildSort(sort) {
  
  switch (sort) {
    case "price_asc": return { price: 1 };
    case "price_desc": return { price: -1 };
    case "stock_desc": return { stock: -1 };
    case "name_asc": return { name: 1 };
    default: return { createdAt: -1 }; // newest
  }
}

export const listProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "12", 10)));
    const filter = buildFilter(req.query);
    const sort = buildSort(req.query.sort);

    const [items, count, categories] = await Promise.all([
      Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean({ virtuals: true }),
      Product.countDocuments(filter),
      Product.distinct("category", { status: "active" })
    ]);

    res.json({
      items,
      page,
      pages: Math.ceil(count / limit),
      count,
      categories
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const doc = await Product.findById(req.params.id).lean({ virtuals: true });
    if (!doc) return res.status(404).json({ message: "Product not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ message: "Invalid product id" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const body = req.body;
    if (body.salePrice && Number(body.salePrice) > Number(body.price)) {
      return res.status(400).json({ message: "salePrice cannot be greater than price" });
    }
    const created = await Product.create(body);
    res.status(201).json(created);

    emitStockUpdate(created);  

  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ message: "SKU already exists" });
    res.status(400).json({ message: e.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.salePrice && Number(body.salePrice) > Number(body.price)) {
      return res.status(400).json({ message: "salePrice cannot be greater than price" });
    }
    const updated = await Product.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);

    emitStockUpdate(updated);


  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// Admin: stock update
export const updateStock = async (req, res) => {
  try {
    const { delta, absolute } = req.body;
    let update;
    if (typeof absolute === "number") {
      if (absolute < 0) return res.status(400).json({ message: "Stock cannot be negative" });
      update = { $set: { stock: absolute } };
    } else if (typeof delta === "number") {
      update = { $inc: { stock: delta } };
    } else {
      return res.status(400).json({ message: "Provide delta or absolute" });
    }
    
    //  never go below 0

    const filter = { _id: req.params.id };
    if (typeof delta === "number" && delta < 0) filter.stock = { $gte: Math.abs(delta) };
    const updated = await Product.findOneAndUpdate(filter, update, { new: true });
    if (!updated) return res.status(400).json({ message: "Insufficient stock or product not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
