import mongoose from 'mongoose';

const advertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: Boolean,
    default: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  }
}, {
  timestamps: true // This will add createdAt and updatedAt fields
});

// Index for better query performance
advertisementSchema.index({ status: 1, startDate: 1, endDate: 1 });

// Virtual field to check if advertisement is currently active
advertisementSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status && now >= this.startDate && now <= this.endDate;
});

// Ensure virtual fields are serialized
advertisementSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Advertisement', advertisementSchema);
