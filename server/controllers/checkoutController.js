import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { emitStockUpdate } from "../sockets/io.js";


export const checkout = async (req, res) => {
  try {
    const { customer, items } = req.body;
    if (!customer?.name || !customer?.email) {
      return res.status(400).json({ message: "Customer name & email are required" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items to checkout" });
    }

    // Fetch current products
    const ids = items.map(i => new mongoose.Types.ObjectId(i.productId));
    const dbProducts = await Product.find({ _id: { $in: ids }, status: "active" }).lean();

    // Map for quick lookup
    const map = new Map(dbProducts.map(p => [p._id.toString(), p]));

    // Validate and compute totals
    let subtotal = 0;
    const orderItems = [];
    for (const cartItem of items) {
      const p = map.get(cartItem.productId);
      if (!p) return res.status(400).json({ message: `Product not available: ${cartItem.productId}` });
      if (p.expiryDate && new Date(p.expiryDate).getTime() <= Date.now()) {
        return res.status(400).json({ message: `Product expired: ${p.name}` });
      }
      const qty = Number(cartItem.qty || 0);
      if (qty <= 0) return res.status(400).json({ message: "Invalid quantity" });
      if (p.stock < qty) return res.status(400).json({ message: `Insufficient stock for ${p.name}` });

      const unitPrice = p.salePrice ?? p.price;
      subtotal += unitPrice * qty;
      orderItems.push({
        productId: p._id,
        sku: p.sku,
        name: p.name,
        price: unitPrice,
        qty
      });
    }

    const tax = 0;       
    const discount = 0;  
    const total = subtotal + tax - discount;

    // Atomic stock decrement via bulkWrite with guards
    const ops = items.map(ci => ({
      updateOne: {
        filter: { _id: ci.productId, stock: { $gte: ci.qty } },
        update: { $inc: { stock: -ci.qty } }
      }
    }));
    const result = await Product.bulkWrite(ops, { ordered: true });
    if (result.nModified !== items.length && result.modifiedCount !== items.length) {
      return res.status(409).json({ message: "Stock changed—please refresh and try again." });
    }

    const order = await Order.create({
      userId: req.user?._id || null,
      customer,
      items: orderItems,
      subtotal,
      tax,
      discount,
      total,
      status: "pending",
      payment: { method: "none" }
    });

    res.status(201).json({ orderId: order._id, total, order });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }


const updated = await Product.find({ _id: { $in: ids } }, { _id: 1, stock: 1 }).lean();
updated.forEach(p => emitStockUpdate(p));

res.status(201).json({ orderId: order._id, total, order });


};
