import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/mongodb.js";
import Product from "./models/Product.js";

await connectDB();

const demo = [
  { name: "Shampoo Nourish", sku: "HP-SHAM-001", category: "Haircare", brand: "L'Oréal", price: 1800, salePrice: 1600, stock: 12, images: [], expiryDate: new Date(Date.now()+35*86400000) },
  { name: "Hair Serum Gloss", sku: "HP-SER-002", category: "Haircare", brand: "Schwarzkopf", price: 2500, stock: 5, images: [], expiryDate: new Date(Date.now()+10*86400000) },
  { name: "Face Cleanser", sku: "SK-CLE-003", category: "Skincare", brand: "Neutrogena", price: 2100, stock: 0, images: [] }
];

await Product.deleteMany({});
await Product.insertMany(demo);
console.log("Seeded products:", demo.length);
await mongoose.connection.close();
process.exit(0);
