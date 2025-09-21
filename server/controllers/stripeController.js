import Stripe from 'stripe';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51S9IQbHMk9ohtPD1woCDycj7eANv7CykBB4XQ0olOt0j0Sq9SSnra7D4XthWAE39yV5ZAR4qQhaWI3oqYGt9hnyc00LOKtVu6w');

// Create Payment Intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'lkr', items } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items are required'
      });
    }

    // Validate items and calculate actual amount
    let calculatedAmount = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }
      
      if (product.stock < item.qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.qty}`
        });
      }
      
      calculatedAmount += product.price * item.qty;
    }

    // Convert to cents/lowest currency unit
    const amountInCents = Math.round(calculatedAmount * 100);

    // Verify the amount matches what was sent
    if (Math.abs(amountInCents - amount) > 1) { // Allow 1 cent tolerance for rounding
      return res.status(400).json({
        success: false,
        message: 'Amount mismatch. Please refresh your cart.'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      payment_method_types: ['card'],
      metadata: {
        userId: req.user?.id || 'guest',
        itemCount: items.length.toString(),
        items: JSON.stringify(items.map(item => ({
          productId: item.productId,
          qty: item.qty,
          name: item.name
        })))
      },
      description: `Order for ${items.length} item(s)`,
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment intent'
    });
  }
};

// Complete Order (called after successful payment)
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
        product: product._id,
        name: product.name,
        price: product.price,
        qty: item.qty,
        subtotal,
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

    // Create order record
    const order = new Order({
      user: req.user?.id,
      items: orderItems,
      totalQty,
      totalAmount,
      status: 'placed',
      paymentDetails: {
        paymentIntentId,
        paymentMethodId: paymentMethod?.id,
        paymentStatus: 'paid',
        paidAmount: totalAmount,
        currency: paymentIntent.currency,
        paymentDate: new Date()
      },
      billingDetails,
      orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    });

    await order.save();

    // Populate product details for response
    await order.populate('items.product', 'name images');

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

// Webhook handler for Stripe events
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_a81bc32c84f30fb8f85c6d062580748f1a4b61ff5b9ccb23c7dc8992a211fd03';

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Update order status if needed
        const order = await Order.findOne({
          'paymentDetails.paymentIntentId': paymentIntent.id
        });
        
        if (order && order.status === 'pending') {
          order.status = 'placed';
          order.paymentDetails.paymentStatus = 'paid';
          await order.save();
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        
        // Handle failed payment - could restore stock, mark order as failed, etc.
        const failedOrder = await Order.findOne({
          'paymentDetails.paymentIntentId': failedPayment.id
        });
        
        if (failedOrder) {
          failedOrder.status = 'cancelled';
          failedOrder.paymentDetails.paymentStatus = 'failed';
          await failedOrder.save();
          
          // Restore stock
          for (const item of failedOrder.items) {
            await Product.findByIdAndUpdate(
              item.product,
              { $inc: { stock: item.qty } }
            );
          }
        }
        break;

      case 'payment_method.attached':
        const paymentMethod = event.data.object;
        console.log('Payment method attached:', paymentMethod.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Retrieve payment intent (for debugging/status checking)
export const getPaymentIntent = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    res.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        created: paymentIntent.created
      }
    });
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve payment intent'
    });
  }
};

// Refund payment (admin only)
export const refundPayment = async (req, res) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
    }

    const refundData = {
      payment_intent: paymentIntentId
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    if (reason) {
      refundData.reason = reason;
    }

    const refund = await stripe.refunds.create(refundData);

    // Update order status
    const order = await Order.findOne({
      'paymentDetails.paymentIntentId': paymentIntentId
    });

    if (order) {
      order.status = refund.amount === order.paymentDetails.paidAmount * 100 ? 'refunded' : 'partially_refunded';
      order.refundDetails = {
        refundId: refund.id,
        refundAmount: refund.amount / 100,
        refundDate: new Date(),
        reason: reason || 'No reason provided'
      };
      await order.save();

      // Restore stock for refunded items
      if (refund.amount === order.paymentDetails.paidAmount * 100) {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: item.qty } }
          );
        }
      }
    }

    res.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process refund'
    });
  }
};