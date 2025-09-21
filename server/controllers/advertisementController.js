import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import Advertisement from "../models/Advertisement.js";

const adsDir = path.resolve("uploads", "ads");

export const listAds = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const status = req.query.status;

    const q = {};
    if (status === "true") q.status = true;
    if (status === "false") q.status = false;

    const total = await Advertisement.countDocuments(q);
    const data = await Advertisement.find(q)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ success: true, total, page, limit, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAd = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id).lean();
    if (!ad) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: ad });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createAd = async (req, res) => {
  try {
    const { title, description = "", startDate, endDate, status = true } = req.body;
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const ad = await Advertisement.create({
      title,
      description,
      image: req.file.filename,
      startDate,
      endDate,
      status,
      createdBy: req.user?.email || "admin",
    });

    res.status(201).json({ success: true, message: "Advertisement created", data: ad });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateAd = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) return res.status(404).json({ success: false, message: "Not found" });

    // Swap image if new file uploaded
    if (req.file && ad.image) {
      const old = path.join(adsDir, ad.image);
      fs.existsSync(old) && (await fsp.unlink(old).catch(() => {}));
      ad.image = req.file.filename;
    }

    const fields = ["title", "description", "startDate", "endDate", "status"];
    fields.forEach((f) => {
      if (typeof req.body[f] !== "undefined") ad[f] = req.body[f];
    });

    await ad.save();
    res.json({ success: true, message: "Advertisement updated", data: ad });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteAd = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) return res.status(404).json({ success: false, message: "Not found" });

    if (ad.image) {
      const old = path.join(adsDir, ad.image);
      fs.existsSync(old) && (await fsp.unlink(old).catch(() => {}));
    }
    await ad.deleteOne();

    res.json({ success: true, message: "Advertisement deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
