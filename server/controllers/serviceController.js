import mongoose from "mongoose";
import Service, { SERVICE_CATEGORIES } from "../models/Service.js";


export async function listServices(req, res) {
  try {
    const {
      category,
      q,
      minPrice,
      maxPrice,
      activeOnly = "true",
      group = "false",
    } = req.query;



    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (activeOnly === "true") filter.isActive = true;
    if (q) filter.name = { $regex: q.trim(), $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const services = await Service.find(filter).sort({ category: 1, name: 1 });

    if (group === "true") {
      const groupsMap = {};
      for (const s of services) {
        if (!groupsMap[s.category]) groupsMap[s.category] = [];
        groupsMap[s.category].push(s);
      }

      const groups = Object.entries(groupsMap).map(([cat, items]) => ({
        category: cat,
        items,
      }));

      return res.json({ success: true, groups, categories: SERVICE_CATEGORIES });

    }

    res.json({ success: true, services, categories: SERVICE_CATEGORIES });

  } catch (e) {

    res.status(500).json({ success: false, message: e.message });

  }
}

// Admin create
 
export async function createService(req, res) {
  try {
    const { name, description, price, durationMins, category, isActive = true } = req.body;

    if (!name || !price || !durationMins || !category) {
      return res.json({ success: false, message: "Missing required fields" });
    }
    if (!SERVICE_CATEGORIES.includes(category)) {
      return res.json({ success: false, message: "Invalid category" });
    }

    const doc = await Service.create({
      name: name.trim(),
      description: (description || "").trim(),
      price: Number(price),
      durationMins: Number(durationMins),
      category,
      isActive: Boolean(isActive),
    });
    res.status(201).json({ success: true, service: doc });
  } catch (e) {

    // handle duplicate name
    if (e.code === 11000) {
      return res.json({
        success: false,
        message: "Service with this name already exists in the selected category",
      });
    }
    res.status(500).json({ success: false, message: e.message });
  }
}

// Admin update

export async function updateService(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.json({ success: false, message: "Invalid service id" });
    }
    const payload = { ...req.body };
    if (payload.name) payload.name = payload.name.trim();
    if (payload.description != null) payload.description = (payload.description || "").trim();

    const updated = await Service.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.json({ success: false, message: "Service not found" });

    res.json({ success: true, service: updated });
  } catch (e) {
    if (e.code === 11000) {
      return res.json({
        success: false,
        message: "Service with this name already exists in the selected category",
      });
    }
    res.status(500).json({ success: false, message: e.message });
  }
}

// Admin delete 

export async function deleteService(req, res) {
  try {
    const { id } = req.params;
    const { hard = "false" } = req.query;
    if (!mongoose.isValidObjectId(id)) {
      return res.json({ success: false, message: "Invalid service id" });
    }

    if (hard === "true") {
      await Service.findByIdAndDelete(id);
      return res.json({ success: true });
    }

    const s = await Service.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!s) return res.json({ success: false, message: "Service not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

// Monthly usage report

export async function monthlyUsageReport(req, res) {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month); 
    const status = (req.query.status || "completed,booked")
      .split(",")
      .map((s) => s.trim().toLowerCase());

    if (!year || !month || month < 1 || month > 12) {
      return res.json({ success: false, message: "Provide valid year & month (1-12)" });
    }

    const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const to = new Date(Date.UTC(year, month, 1, 0, 0, 0));

    
    const collections = (await mongoose.connection.db.listCollections().toArray()).map(
      (c) => c.name
    );
    if (!collections.includes("appointments")) {
      return res.json({
        success: true,
        from,
        to,
        summary: { totalAppointments: 0, completed: 0, canceled: 0, uniqueCustomers: 0 },
        byService: [],
        byCategory: [],
        topServices: [],
        note: "No appointments collection found; report shows zeroes.",
      });
    }

   
    const pipeline = [
      { $match: { startTime: { $gte: from, $lt: to }, status: { $in: status } } },
      {
        $group: {
          _id: "$service",
          count: { $sum: 1 },
          
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },
      {
        $project: {
          _id: 0,
          serviceId: "$service._id",
          name: "$service.name",
          category: "$service.category",
          price: "$service.price",
          count: 1,
          estRevenue: { $multiply: ["$count", "$service.price"] },
        },
      },
      { $sort: { count: -1, name: 1 } },
    ];

    const apptCol = mongoose.connection.collection("appointments");
    const byService = await apptCol.aggregate(pipeline).toArray();


    // category grouping

    const byCategoryMap = {};

    for (const r of byService) {
      if (!byCategoryMap[r.category]) byCategoryMap[r.category] = { category: r.category, count: 0, estRevenue: 0 };
      byCategoryMap[r.category].count += r.count;
      byCategoryMap[r.category].estRevenue += r.estRevenue;
    }
    const byCategory = Object.values(byCategoryMap).sort((a, b) => b.count - a.count);

    // summary

    const totalAppointments = byService.reduce((a, b) => a + b.count, 0);

    const summary = {
      totalAppointments,
      completed: status.includes("completed") ? totalAppointments : 0,
      canceled: status.includes("canceled") ? totalAppointments : 0,
      uniqueCustomers: 0, 
    };

    res.json({
      success: true,
      from,
      to,
      summary,
      byService,
      byCategory,
      topServices: byService.slice(0, 5),
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}
