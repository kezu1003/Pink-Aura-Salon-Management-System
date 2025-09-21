import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51S9IQbHMk9ohtPD1woCDycj7eANv7CykBB4XQ0olOt0j0Sq9SSnra7D4XthWAE39yV5ZAR4qQhaWI3oqYGt9hnyc00LOKtVu6w');

// Legacy checkout (keeping for backward compatibility)
export const checkout = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items provided" });
    }

    let totalQty = 0;
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.qty }, isActive: true },
        { $inc: { stock: -item.qty } },
        { new: true }
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product unavailable or not enough stock: ${item.productId}`,
        });
      }

      const subtotal = product.price * item.qty;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        qty: item.qty,
        subtotal,
      });

      totalQty += item.qty;
      totalAmount += subtotal;
    }

    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalQty,
      totalAmount,
    });

    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const completeOrder = async (req, res) => {
  try {
    const { paymentIntentId, items, billingDetails, paymentMethod } = req.body;

    if (!paymentIntentId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID and items are required'
      });
    }

    // Retrieve payment intent from Stripe to verify it's paid
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment has not been completed'
      });
    }

    let totalQty = 0;
    let totalAmount = 0;
    const orderItems = [];

    // Process each item and update stock
    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.qty }, isActive: true },
        { $inc: { stock: -item.qty } },
        { new: true }
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product unavailable or insufficient stock: ${item.productId}`,
        });
      }

      const subtotal = product.price * item.qty;
      orderItems.push({
        productId: product._id, // Changed from 'product' to 'productId'
        name: product.name,
        price: product.price,
        qty: item.qty,
        image: product.images?.[0] || '' // Add image if available
      });

      totalQty += item.qty;
      totalAmount += subtotal;
    }

    // Verify the payment amount matches calculated total
    const expectedAmount = Math.round(totalAmount * 100);
    if (Math.abs(paymentIntent.amount - expectedAmount) > 1) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount mismatch'
      });
    }

    // Create order record with proper structure
    const order = new Order({
      user: req.user?.id,
      items: orderItems,
      amount: totalAmount, // Add the required amount field
      status: 'placed', // This is now valid after the enum update
      paymentIntentId,
      paymentMethod: paymentMethod?.type || 'card',
      billingDetails,
      orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    });

    // Add card details if available from payment method
    if (paymentMethod?.card) {
      order.cardBrand = paymentMethod.card.brand;
      order.last4 = paymentMethod.card.last4;
    }

    await order.save();

    res.json({
      success: true,
      order,
      message: 'Order completed successfully'
    });

  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete order'
    });
  }
};
// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      startDate, 
      endDate 
    } = req.query;
    
    const userId = req.user.id;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { user: userId };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Get orders and total count
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      Order.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch orders'
    });
  }
};

// Get single order details
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    
    // First, try to find the order with proper error handling
    const order = await Order.findOne({ 
      _id: orderId
    }).populate('items.productId', 'name images brand');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if the order belongs to the user (unless admin)
    const isAdmin = req.user.role === 'admin';
    if (order.user.toString() !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.'
      });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    
    // Handle specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch order'
    });
  }
};

// Cancel order (if eligible)
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    
    const order = await Order.findOne({ 
      _id: orderId, 
      user: userId 
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (!order.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }
    
    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.qty } }
      );
    }
    
    // Update order status
    await order.updateStatus('cancelled', reason || 'Cancelled by customer', userId);
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel order'
    });
  }
};

// Admin: Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      startDate, 
      endDate,
      search
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'billingDetails.name': { $regex: search, $options: 'i' } },
        { 'billingDetails.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      Order.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch orders'
    });
  }
};

// Admin: Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note, trackingInfo } = req.body;
    const adminId = req.user.id;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update tracking info if provided
    if (trackingInfo) {
      order.trackingInfo = { ...order.trackingInfo, ...trackingInfo };
      
      if (status === 'shipped' && trackingInfo.trackingNumber) {
        order.trackingInfo.shippedDate = new Date();
      }
      
      if (status === 'delivered') {
        order.trackingInfo.actualDelivery = new Date();
      }
    }
    
    // Update status
    await order.updateStatus(status, note, adminId);
    
    // Populate for response
    await order.populate('user', 'name email');
    await order.populate('items.product', 'name images');
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update order status'
    });
  }
};

// Admin: Get order statistics
export const getOrderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    const [
      totalOrders,
      ordersByStatus,
      revenueStats,
      topProducts
    ] = await Promise.all([
      // Total orders count
      Order.countDocuments(dateFilter),
      
      // Orders by status
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      // Revenue statistics
      Order.aggregate([
        { $match: { ...dateFilter, status: { $in: ['placed', 'processing', 'shipped', 'delivered'] } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            averageOrderValue: { $avg: '$totalAmount' },
            totalItemsSold: { $sum: '$totalQty' }
          }
        }
      ]),
      
      // Top selling products
      Order.aggregate([
        { $match: { ...dateFilter, status: { $in: ['placed', 'processing', 'shipped', 'delivered'] } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.qty' },
            revenue: { $sum: '$items.subtotal' },
            productName: { $first: '$items.name' }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 }
      ])
    ]);
    
    res.json({
      success: true,
      stats: {
        totalOrders,
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        revenue: revenueStats[0] || {
          totalRevenue: 0,
          averageOrderValue: 0,
          totalItemsSold: 0
        },
        topProducts
      }
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch order statistics'
    });
  }
};