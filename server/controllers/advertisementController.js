import Advertisement from '../models/Advertisement.js';
import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create new advertisement
const createAdvertisement = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, startDate, endDate, status } = req.body;
    
    // Check if a media file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Media file (image or video) is required'
      });
    }

    // Create new advertisement
    const advertisement = new Advertisement({
      title,
      description,
      image: req.file.filename, // Store filename (image or video)
      mediaType: req.file.mimetype && req.file.mimetype.startsWith('video/') ? 'video' : 'image',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status === 'true' || status === true
    });

    const savedAd = await advertisement.save();

    res.status(201).json({
      success: true,
      message: 'Advertisement created successfully',
      data: savedAd
    });
  } catch (error) {
    console.error('Error creating advertisement:', error);
    
    // Delete uploaded file if advertisement creation fails
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error creating advertisement',
      error: error.message
    });
  }
};

// Get all advertisements with pagination
const getAdvertisements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query based on filters
    const query = {};
    if (req.query.status !== undefined) {
      query.status = req.query.status === 'true';
    }

    const advertisements = await Advertisement.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    const total = await Advertisement.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: advertisements,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching advertisements',
      error: error.message
    });
  }
};

// Get single advertisement
const getAdvertisement = async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    res.json({
      success: true,
      data: advertisement
    });
  } catch (error) {
    console.error('Error fetching advertisement:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching advertisement',
      error: error.message
    });
  }
};

// Update advertisement
const updateAdvertisement = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    const { title, description, startDate, endDate, status } = req.body;
    const updateData = {};
    
    // Only update fields that are provided
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (status !== undefined) updateData.status = status === 'true' || status === true;

    // Handle image update
    if (req.file) {
      // Delete old media file
      const oldImagePath = path.join(__dirname, '../uploads', advertisement.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      updateData.image = req.file.filename;
      updateData.mediaType = req.file.mimetype && req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    const updatedAd = await Advertisement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Advertisement updated successfully',
      data: updatedAd
    });
  } catch (error) {
    console.error('Error updating advertisement:', error);
    
    // Delete uploaded file if update fails
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error updating advertisement',
      error: error.message
    });
  }
};

// Delete advertisement
const deleteAdvertisement = async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    // Delete image file
    const imagePath = path.join(__dirname, '../uploads', advertisement.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await Advertisement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Advertisement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting advertisement',
      error: error.message
    });
  }
};

export {
  createAdvertisement,
  getAdvertisements,
  getAdvertisement,
  updateAdvertisement,
  deleteAdvertisement
};
