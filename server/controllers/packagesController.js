import mongoose from "mongoose";
import Package from "../models/Package.js";

export async function listPackages(req, res) {
  try {
    const {
      category,
      q,
      minPrice,
      maxPrice,
      activeOnly = "true",
      includeArchived = "false",
      sort = "new", 
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (activeOnly === "true") filter.isActive = true;
    if (includeArchived !== "true") filter.isArchived = false;
    if (q) filter.name = { $regex: q.trim(), $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      popularity: { popularityScore: -1, createdAt: -1 },
      new: { createdAt: -1 },
    };

    const docs = await Package.find(filter)
      .sort(sortMap[sort] || sortMap.new)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Package.countDocuments(filter);

    res.json({
      success: true,
      packages: docs,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      categories: ["All", "Hair", "Nails", "Makeup", "Facials", "Other", "Bridal", "Spa"].filter(
        (v, i, a) => a.indexOf(v) === i
      ),
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

export async function getPackage(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.json({ success: false, message: "Invalid package id" });
    }
    const doc = await Package.findById(id);
    if (!doc) return res.json({ success: false, message: "Package not found" });
    res.json({ success: true, package: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

export async function createPackage(req, res) {
  try {
    const {
      name,
      description = "",
      servicesIncluded = [],
      category = "Other",
      price,
      discountPrice = null,
      estimatedTimeMins = 60,
      image = "",
      seasonalOffer = {},
      isActive = true,
    } = req.body;

    if (!name || price == null) {
      return res.json({ success: false, message: "Name and price are required" });
    }

    const created = await Package.create({
      name: name.trim(),
      description: description.trim(),
      servicesIncluded,
      category,
      price: Number(price),
      discountPrice: discountPrice == null ? null : Number(discountPrice),
      estimatedTimeMins: Number(estimatedTimeMins),
      image: String(image || ""),
      seasonalOffer: {
        enabled: !!seasonalOffer?.enabled,
        label: seasonalOffer?.label || "",
        startsAt: seasonalOffer?.startsAt || null,
        endsAt: seasonalOffer?.endsAt || null,
      },
      isActive: !!isActive,
    });

    res.status(201).json({ success: true, package: created });
  } catch (e) {
    if (e.code === 11000) {
      return res.json({ success: false, message: "A package with this name already exists in this category" });
    }
    res.status(500).json({ success: false, message: e.message });
  }
}

export async function updatePackage(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.json({ success: false, message: "Invalid package id" });
    }
    const payload = { ...req.body };
    if (payload.name) payload.name = payload.name.trim();
    if (payload.description != null) payload.description = String(payload.description || "").trim();

    const updated = await Package.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!updated) return res.json({ success: false, message: "Package not found" });
    res.json({ success: true, package: updated });
  } catch (e) {
    if (e.code === 11000) {
      return res.json({ success: false, message: "A package with this name already exists in this category" });
    }
    res.status(500).json({ success: false, message: e.message });
  }
}

export async function archivePackage(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.json({ success: false, message: "Invalid package id" });
    }
    const doc = await Package.findByIdAndUpdate(id, { isArchived: true, isActive: false }, { new: true });
    if (!doc) return res.json({ success: false, message: "Package not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

export async function restorePackage(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.json({ success: false, message: "Invalid package id" });
    }
    const doc = await Package.findByIdAndUpdate(id, { isArchived: false, isActive: true }, { new: true });
    if (!doc) return res.json({ success: false, message: "Package not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

export async function deletePackage(req, res) {
  try {
    const { id } = req.params;
    const { hard = "false" } = req.query;
    if (!mongoose.isValidObjectId(id)) {
      return res.json({ success: false, message: "Invalid package id" });
    }
    if (hard === "true") {
      await Package.findByIdAndDelete(id);
      return res.json({ success: true });
    }
    
    const doc = await Package.findByIdAndUpdate(id, { isArchived: true, isActive: false }, { new: true });
    if (!doc) return res.json({ success: false, message: "Package not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}
