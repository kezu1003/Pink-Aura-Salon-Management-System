// models/orderModel.js (Updated to include transaction fields)
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Basic order information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Payment information
  paymentIntentId: {
    type: String,
    unique: true,
    sparse: true // Allows null values but ensures uniqueness when present
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    default: 'LKR',
    uppercase: true
  },
  
  status: {
    type: String,
    enum: ['pending','placed', 'succeeded', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Payment method details
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'bank_transfer', 'mobile_payment'],
    default: 'card'
  },
  
  cardBrand: {
    type: String,
    enum: ['visa', 'mastercard', 'amex', 'discover', 'jcb', 'diners', 'unionpay', 'unknown'],
    lowercase: true
  },
  
  last4: {
    type: String,
    validate: {
      validator: function(val) {
        return !val || /^\d{4}$/.test(val);
      },
      message: 'Last 4 digits must be exactly 4 numbers'
    }
  },
  
  // Order items
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    qty: {
      type: Number,
      required: true,
      min: 1
    },
    image: String
  }],
  
  // Billing details
  billingDetails: {
    name: String,
    email: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postal_code: String,
      country: { type: String, default: 'LK' }
    }
  },
  
  // Order tracking
  orderNumber: {
    type: String,
    unique: true
  },
  
  // Admin notes
  adminNotes: [{
    note: {
      type: String,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Fulfillment
  fulfillmentStatus: {
    type: String,
    enum: ['unfulfilled', 'partial', 'fulfilled', 'cancelled'],
    default: 'unfulfilled'
  },
  
  shippingAddress: {
    name: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postal_code: String,
    country: { type: String, default: 'LK' }
  },
  
  // Timestamps
  paidAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentIntentId: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Virtual for total amount calculation
orderSchema.virtual('totalAmount').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.qty), 0);
});

// Virtual for items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.qty, 0);
});

// Static method to get transaction statistics
orderSchema.statics.getTransactionStats = async function(dateFilter = {}) {
  return this.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' },
        successfulTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, 1, 0] }
        },
        successfulAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, '$amount', 0] }
        },
        pendingTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        failedTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        }
      }
    }
  ]);
};
orderSchema.methods.calculateTotalAmount = function() {
  return this.items.reduce((total, item) => {
    return total + ((item.price || 0) * (item.qty || 0));
  }, 0);
};
orderSchema.pre('save', function(next) {
  // Generate order number if not exists
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
  
  // Ensure amount is calculated from items if not set or is 0
  if (!this.amount || this.amount === 0) {
    this.amount = this.calculateTotalAmount();
  }
  
  next();
});

// Static method to update existing orders without amounts
orderSchema.statics.fixMissingAmounts = async function() {
  try {
    const ordersWithoutAmount = await this.find({ 
      $or: [
        { amount: { $exists: false } }, 
        { amount: 0 }, 
        { amount: null }
      ] 
    });
    
    console.log(`Found ${ordersWithoutAmount.length} orders without amounts`);
    
    for (const order of ordersWithoutAmount) {
      const calculatedAmount = order.items.reduce((total, item) => {
        return total + ((item.price || 0) * (item.qty || 0));
      }, 0);
      
      await this.findByIdAndUpdate(order._id, { amount: calculatedAmount });
      console.log(`Updated order ${order.orderNumber} with amount ${calculatedAmount}`);
    }
    
    return { updated: ordersWithoutAmount.length };
  } catch (error) {
    console.error('Error fixing missing amounts:', error);
    throw error;
  }
};
// Static method to get daily trends
orderSchema.statics.getDailyTrends = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        date: { $first: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } },
        transactions: { $sum: 1 },
        amount: { $sum: '$amount' },
        successful: {
          $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, 1, 0] }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;