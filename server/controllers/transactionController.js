// controllers/transactionController.js - Complete fix with proper amount calculation
import Order from '../models/Order.js';

// Helper function to calculate order amount from items
const calculateOrderAmount = (order) => {
  if (order.amount && order.amount > 0) {
    return order.amount;
  }
  
  // Calculate from items
  if (!order.items || order.items.length === 0) {
    return 0;
  }
  
  return order.items.reduce((total, item) => {
    const price = parseFloat(item.price) || 0;
    const qty = parseInt(item.qty) || 0;
    return total + (price * qty);
  }, 0);
};

// GET /api/admin/transactions - Get all transactions with filtering and pagination
export const getAllTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentMethod,
      search,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log('Fetching transactions with params:', {
      page, limit, status, paymentMethod, search, dateFrom, dateTo, sortBy, sortOrder
    });

    // Build filter object
    const filter = {};

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Payment method filter
    if (paymentMethod && paymentMethod !== 'all') {
      filter.paymentMethod = paymentMethod;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.createdAt.$lte = new Date(dateTo);
      }
    }

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { paymentIntentId: searchRegex },
        { orderNumber: searchRegex }
      ];
    }

    console.log('Database filter:', filter);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get transactions with user population
    const transactions = await Order.find(filter)
      .populate('user', 'name email')
      .populate('items.productId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`Found ${transactions.length} transactions`);

    // Process transactions to ensure amount is calculated correctly
    const processedTransactions = transactions.map((transaction, index) => {
      const transactionObj = transaction.toObject();
      
      // Calculate the correct amount
      const calculatedAmount = calculateOrderAmount(transactionObj);
      transactionObj.amount = calculatedAmount;
      
      console.log(`Transaction ${index + 1}:`, {
        id: transactionObj._id,
        orderNumber: transactionObj.orderNumber,
        originalAmount: transaction.amount,
        calculatedAmount: calculatedAmount,
        itemsCount: transactionObj.items?.length || 0,
        items: transactionObj.items?.map(item => ({
          name: item.name,
          price: item.price,
          qty: item.qty,
          total: (item.price || 0) * (item.qty || 0)
        }))
      });
      
      return transactionObj;
    });

    // Get total count for pagination
    const totalTransactions = await Order.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(totalTransactions / parseInt(limit));

    const response = {
      success: true,
      data: {
        transactions: processedTransactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalTransactions,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    };

    console.log('API Response structure:', {
      success: response.success,
      transactionsCount: response.data.transactions.length,
      firstTransactionAmount: response.data.transactions[0]?.amount,
      pagination: response.data.pagination
    });

    res.json(response);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
};

// GET /api/admin/transactions/summary - Get transactions summary
export const getTransactionsSummary = async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    
    console.log('Fetching summary for period:', period);

    let days = 30;
    if (period === 'today') days = 0;
    else if (period === '7days') days = 7;
    else if (period === '30days') days = 30;
    
    const startDate = new Date();
    if (days > 0) {
      startDate.setDate(startDate.getDate() - days);
    } else {
      startDate.setHours(0, 0, 0, 0);
    }

    const filter = { createdAt: { $gte: startDate } };
    console.log('Summary filter:', filter);

    // Get all orders for the period
    const orders = await Order.find(filter);
    console.log(`Found ${orders.length} orders for summary`);

    // Calculate statistics
    let totalTransactions = 0;
    let totalAmount = 0;
    let successfulTransactions = 0;
    let successfulAmount = 0;
    let pendingTransactions = 0;
    let failedTransactions = 0;

    orders.forEach((order, index) => {
      const calculatedAmount = calculateOrderAmount(order.toObject());
      
      console.log(`Summary Order ${index + 1}:`, {
        id: order._id,
        status: order.status,
        originalAmount: order.totalAmount,
        calculatedAmount: calculatedAmount,
        itemsCount: order.items?.length || 0
      });

      totalTransactions++;
      totalAmount += calculatedAmount;

      switch (order.status) {
        case 'succeeded':
          successfulTransactions++;
          successfulAmount += calculatedAmount;
          break;
        case 'pending':
          pendingTransactions++;
          break;
        case 'failed':
          failedTransactions++;
          break;
      }
    });

    const summary = {
      totalTransactions,
      totalAmount: Math.round(totalAmount * 100) / 100,
      averageAmount: totalTransactions > 0 ? Math.round((totalAmount / totalTransactions) * 100) / 100 : 0,
      successfulTransactions,
      successfulAmount: Math.round(successfulAmount * 100) / 100,
      pendingTransactions,
      failedTransactions
    };

    console.log('Calculated summary:', summary);

    res.json({
      success: true,
      data: {
        summary
      }
    });
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction summary',
      error: error.message
    });
  }
};

// GET /api/admin/transactions/:id - Get specific transaction details
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Order.findById(id)
      .populate('user', 'name email phone')
      .populate('items.productId', 'name images category')
      .populate('adminNotes.addedBy', 'name');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Ensure amount is calculated correctly
    const transactionObj = transaction.toObject();
    transactionObj.amount = calculateOrderAmount(transactionObj);

    res.json({
      success: true,
      data: transactionObj
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction details',
      error: error.message
    });
  }
};

// PUT /api/admin/transactions/:id/status - Update transaction status
export const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['pending', 'succeeded', 'failed', 'refunded', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided'
      });
    }

    const updateData = { status };
    if (status === 'succeeded') {
      updateData.paidAt = new Date();
    }

    const transaction = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Add admin note if provided
    if (notes) {
      transaction.adminNotes.push({
        note: `Status updated to ${status}: ${notes}`,
        addedBy: req.userId || req.user?.id,
        addedAt: new Date()
      });
      await transaction.save();
    }

    // Ensure amount is calculated correctly in response
    const transactionObj = transaction.toObject();
    transactionObj.amount = calculateOrderAmount(transactionObj);

    res.json({
      success: true,
      message: 'Transaction status updated successfully',
      data: transactionObj
    });
  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction status',
      error: error.message
    });
  }
};

// GET /api/admin/transactions/export - Export transactions
export const exportTransactions = async (req, res) => {
  try {
    const {
      status,
      paymentMethod,
      dateFrom,
      dateTo,
      format = 'csv'
    } = req.query;

    // Build filter
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (paymentMethod && paymentMethod !== 'all') filter.paymentMethod = paymentMethod;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const transactions = await Order.find(filter)
      .populate('user', 'name email')
      .populate('items.productId', 'name')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const csvData = transactions.map(transaction => {
        const amount = calculateOrderAmount(transaction.toObject());
        
        return {
          'Order Number': transaction.orderNumber,
          'Payment Intent ID': transaction.paymentIntentId || 'N/A',
          'Customer Name': transaction.user?.name || 'N/A',
          'Customer Email': transaction.user?.email || 'N/A',
          'Amount': amount.toFixed(2),
          'Currency': transaction.currency || 'LKR',
          'Status': transaction.status,
          'Payment Method': transaction.paymentMethod || 'N/A',
          'Card Brand': transaction.cardBrand || 'N/A',
          'Last 4': transaction.last4 || 'N/A',
          'Created At': transaction.createdAt.toISOString(),
          'Items Count': transaction.items?.length || 0
        };
      });

      const headers = Object.keys(csvData[0] || {}).join(',');
      const rows = csvData.map(row => Object.values(row).join(',')).join('\n');
      const csv = headers + '\n' + rows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=transactions-${Date.now()}.csv`);
      res.send(csv);
    } else {
      const processedTransactions = transactions.map(transaction => {
        const transactionObj = transaction.toObject();
        transactionObj.amount = calculateOrderAmount(transactionObj);
        return transactionObj;
      });

      res.json({
        success: true,
        data: {
          transactions: processedTransactions,
          exportedAt: new Date().toISOString(),
          totalRecords: processedTransactions.length
        }
      });
    }
  } catch (error) {
    console.error('Error exporting transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export transactions',
      error: error.message
    });
  }
};