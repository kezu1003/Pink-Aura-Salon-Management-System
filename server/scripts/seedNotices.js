import mongoose from 'mongoose';
import Notice from '../models/Notice.js';
import userModel from '../models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedNotices() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/Pink-Aura-Salon-Management-System`);
    console.log('Connected to MongoDB');

    // Find an admin user to be the creator
    const admin = await userModel.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin user found. Please create an admin user first.');
      return;
    }

    // Clear existing notices
    await Notice.deleteMany({});
    console.log('Cleared existing notices');

    // Create sample notices
    const sampleNotices = [
      {
        title: "Team Meeting",
        body: "Weekly team meeting scheduled for Friday at 5:00 PM. Please prepare your weekly reports.",
        type: "meeting",
        priority: "high",
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        createdBy: admin._id,
        targetRoles: ["staff"]
      },
      {
        title: "New Service Training",
        body: "Training session for the new facial treatment service will be held next Monday at 10:00 AM.",
        type: "training",
        priority: "medium",
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        createdBy: admin._id,
        targetRoles: ["staff"]
      },
      {
        title: "Inventory Update",
        body: "Please check your station supplies and submit inventory requests by end of week.",
        type: "inventory",
        priority: "low",
        expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        createdBy: admin._id,
        targetRoles: ["staff"]
      },
      {
        title: "Customer Feedback Focus",
        body: "Management has noticed excellent customer feedback this month. Keep up the great work!",
        type: "feedback",
        priority: "low",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdBy: admin._id,
        targetRoles: ["staff"]
      },
      {
        title: "Schedule Change",
        body: "Due to upcoming holiday, working hours will be adjusted next week. Check your updated schedule.",
        type: "schedule",
        priority: "high",
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        createdBy: admin._id,
        targetRoles: ["staff"]
      }
    ];

    const createdNotices = await Notice.insertMany(sampleNotices);
    console.log(`Created ${createdNotices.length} sample notices`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding notices:', error);
    process.exit(1);
  }
}

seedNotices();
