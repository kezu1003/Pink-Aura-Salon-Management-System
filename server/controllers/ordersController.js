import Product from "../models/Product.js";
import Order from "../models/Order.js";

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
