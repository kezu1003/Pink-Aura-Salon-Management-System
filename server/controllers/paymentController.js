import Payment from '../models/payment.js';

// Get all payment methods for a user
export const getUserPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await Payment.find({ user: req.userId })
      .sort('-isDefault -createdAt');
    
    res.status(200).json({
      success: true,
      count: paymentMethods.length,
      data: paymentMethods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving payment methods',
      error: error.message
    });
  }
};

// Get a specific payment method
export const getPaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await Payment.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    res.status(200).json({
      success: true,
      data: paymentMethod
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving payment method',
      error: error.message
    });
  }
};

// Add a new payment method
export const addPaymentMethod = async (req, res) => {
  try {
    const {
      cardNumber,
      cardBrand,
      expMonth,
      expYear,
      billingDetails,
      isDefault
    } = req.body;

    // Validate required fields
    if (!cardNumber || !cardBrand || !expMonth || !expYear) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: cardNumber, cardBrand, expMonth, expYear'
      });
    }

    // Extract last 4 digits from card number
    const last4 = cardNumber.slice(-4);
    
    // Auto-generate payment method ID
    const paymentMethodId = `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // If this is the first payment method, make it default
    const existingCount = await Payment.countDocuments({ user: req.userId });
    const shouldBeDefault = isDefault || existingCount === 0;

    // Create new payment method
    const paymentMethod = await Payment.create({
      user: req.userId,
      paymentMethodId,
      cardBrand: cardBrand.toLowerCase(),
      last4,
      expMonth: parseInt(expMonth),
      expYear: parseInt(expYear),
      billingDetails: billingDetails || {},
      isDefault: shouldBeDefault
    });

    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: paymentMethod
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error adding payment method',
      error: error.message
    });
  }
};

// Update a payment method
export const updatePaymentMethod = async (req, res) => {
  try {
    const {
      billingDetails,
      isDefault
    } = req.body;

    // Find payment method and ensure it belongs to the user
    let paymentMethod = await Payment.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // Update fields
    if (billingDetails) {
      paymentMethod.billingDetails = { ...paymentMethod.billingDetails, ...billingDetails };
    }
    if (typeof isDefault !== 'undefined') {
      paymentMethod.isDefault = isDefault;
    }

    // Save changes
    paymentMethod = await paymentMethod.save();

    res.status(200).json({
      success: true,
      message: 'Payment method updated successfully',
      data: paymentMethod
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating payment method',
      error: error.message
    });
  }
};

// Delete a payment method
export const deletePaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await Payment.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // If deleting the default payment method, set another one as default
    if (paymentMethod.isDefault) {
      const otherMethod = await Payment.findOne({
        user: req.userId,
        _id: { $ne: req.params.id }
      }).sort('-createdAt');

      if (otherMethod) {
        otherMethod.isDefault = true;
        await otherMethod.save();
      }
    }

    await Payment.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    res.status(200).json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting payment method',
      error: error.message
    });
  }
};

// Set a payment method as default
export const setDefaultPaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await Payment.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    paymentMethod.isDefault = true;
    await paymentMethod.save();

    res.status(200).json({
      success: true,
      message: 'Payment method set as default',
      data: paymentMethod
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error setting default payment method',
      error: error.message
    });
  }
};

// Get user's default payment method
export const getDefaultPaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await Payment.getDefault(req.userId);

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'No default payment method found'
      });
    }

    res.status(200).json({
      success: true,
      data: paymentMethod
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving default payment method',
      error: error.message
    });
  }
};