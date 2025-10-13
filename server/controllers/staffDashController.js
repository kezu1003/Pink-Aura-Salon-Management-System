import mongoose from "mongoose"; 
import userModel from "../models/userModel.js";
import Appointment from "../models/Appointment.js";
import Review from "../models/Review.js";
import Service from "../models/Service.js";
import Notice from "../models/Notice.js";
import { capsFor } from "../config/capabilities.js";
import { startOfDay, endOfDay, subDays, subMonths } from "date-fns";

export const staffMe = async (req, res) => {
  const user = await userModel.findById(req.userId).lean();
  if (!user) return res.status(401).json({ success: false, message: "User not found" });
  const permissions = capsFor(user);
  return res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      jobTitle: user.jobTitle || "",
      permissions,
    },
  });
};

// Get staff performance metrics and ratings
export const getStaffPerformance = async (req, res) => {
  try {
    const staffId = req.userId;
    const { period = '30' } = req.query; // days
    const days = parseInt(period);
    
    const startDate = subDays(new Date(), days);
    const endDate = new Date();

    const staffObjectId = new mongoose.Types.ObjectId(staffId); // ✅ added

    // Get rating statistics
    const ratingStats = await Review.aggregate([
      { $match: { staff: staffObjectId, createdAt: { $gte: startDate, $lte: endDate } } }, // ✅ changed
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: {
              $switch: {
                branches: [
                  { case: { $eq: ['$rating', 5] }, then: 'five' },
                  { case: { $eq: ['$rating', 4] }, then: 'four' },
                  { case: { $eq: ['$rating', 3] }, then: 'three' },
                  { case: { $eq: ['$rating', 2] }, then: 'two' },
                  { case: { $eq: ['$rating', 1] }, then: 'one' }
                ],
                default: 'other'
              }
            }
          }
        }
      }
    ]);

    // Get appointment statistics
    const appointmentStats = await Appointment.aggregate([
      { 
        $match: { 
          staff: staffObjectId, // ✅ changed
          startTime: { $gte: startDate, $lte: endDate } 
        } 
      },
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          completedAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          noShowAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get recent reviews
    const recentReviews = await Review.find({ staff: staffObjectId }) // ✅ changed
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Calculate completion rate
    const stats = appointmentStats[0] || {};
    const completionRate = stats.totalAppointments > 0 
      ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
      : 0;

    // Calculate rating distribution
    const ratingData = ratingStats[0] || {};
    const distribution = {
      five: 0, four: 0, three: 0, two: 0, one: 0
    };
    
    if (ratingData.ratingDistribution) {
      ratingData.ratingDistribution.forEach(rating => {
        if (distribution.hasOwnProperty(rating)) {
          distribution[rating]++;
        }
      });
    }

    res.json({
      success: true,
      performance: {
        averageRating: ratingData.averageRating ? Math.round(ratingData.averageRating * 10) / 10 : 0,
        totalReviews: ratingData.totalReviews || 0,
        totalAppointments: stats.totalAppointments || 0,
        completedAppointments: stats.completedAppointments || 0,
        cancelledAppointments: stats.cancelledAppointments || 0,
        noShowAppointments: stats.noShowAppointments || 0,
        completionRate,
        ratingDistribution: distribution,
        recentReviews
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get real schedule data for staff
export const listSchedule = async (req, res) => {
  try {
    const staffId = req.userId;
    const { range = 'today' } = req.query;
    
    let startDate, endDate;
    const now = new Date();
    
    switch (range) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'week':
        startDate = startOfDay(now);
        endDate = endOfDay(subDays(now, -7));
        break;
      default:
        startDate = startOfDay(now);
        endDate = endOfDay(now);
    }

    const appointments = await Appointment.find({
      staff: staffId,
      startTime: { $gte: startDate, $lte: endDate }
    })
    .populate('customer', 'name email')
    .populate('services', 'name duration price')
    .sort({ startTime: 1 })
    .lean();

    res.json({ success: true, items: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const startAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const staffId = req.userId;
    
    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, staff: staffId, status: 'confirmed' },
      { status: 'in_progress' },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found or not confirmed" });
    }
    
    res.json({ success: true, message: "Appointment started", appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const staffId = req.userId;
    
    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, staff: staffId, status: 'in_progress' },
      { status: 'completed' },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found or not in progress" });
    }
    
    res.json({ success: true, message: "Appointment completed", appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listAnnouncements = async (req, res) => {
  try {
    const now = new Date();
    
    // Get active notices that haven't expired
    const notices = await Notice.find({
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ],
      targetRoles: { $in: ["staff"] } // Show notices targeted to staff
    })
    .populate('createdBy', 'name')
    .sort({ priority: -1, createdAt: -1 }) // High priority first, then newest
    .lean();

    res.json({ success: true, items: notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInventoryRequest = async (_req, res) => {
  return res.json({ success: true, message: "Inventory request created" });
};

// Supplier
export const listPOs = async (_req, res) => {
  return res.json({
    success: true,
    items: [
      { _id: "po1", code: "PO-1001", status: "shipped" },
      { _id: "po2", code: "PO-1002", status: "pending" },
    ],
  });
};
export const fulfillPO = async (_req, res) => {
  return res.json({ success: true, message: "PO fulfilled" });
};

// Create a new staff notice (admin only)
export const createStaffNotice = async (req, res) => {
  try {
    const { title, body, type, priority, expiresAt } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ success: false, message: "Title and body are required" });
    }

    const notice = await Notice.create({
      title,
      body,
      type: type || 'general',
      priority: priority || 'medium',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.userId,
      targetRoles: ['staff']
    });

    const populatedNotice = await Notice.findById(notice._id)
      .populate('createdBy', 'name')
      .lean();

    res.json({ success: true, message: "Notice created successfully", notice: populatedNotice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a staff notice (admin only)
export const updateStaffNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, type, priority, expiresAt } = req.body;
    
    const notice = await Notice.findByIdAndUpdate(
      id,
      {
        title,
        body,
        type,
        priority,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      { new: true }
    ).populate('createdBy', 'name');

    if (!notice) {
      return res.status(404).json({ success: false, message: "Notice not found" });
    }

    res.json({ success: true, message: "Notice updated successfully", notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a staff notice (admin only)
export const deleteStaffNotice = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notice = await Notice.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!notice) {
      return res.status(404).json({ success: false, message: "Notice not found" });
    }

    res.json({ success: true, message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all notices for admin management
export const getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ isActive: true })
      .populate('createdBy', 'name')
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, items: notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
