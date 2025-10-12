import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// ES6 module path fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import productRoutes from "./routes/productsRoutes.js";


import adminRoutes from "./routes/adminRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";

import paymentRoutes from "./routes/paymentRoutes.js";

import orderRoutes from "./routes/ordersRoutes.js";

import reviewsRoutes from "./routes/reviewsRoutes.js";
import reviewReportsRoutes from "./routes/reviewReportsRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import servicesRoutes from "./routes/servicesRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

import appointmentsRoutes from "./routes/appointmentsRoutes.js";

import packagesRoutes from "./routes/packagesRoutes.js";
import serviceReportsRoutes from "./routes/serviceReportsRoutes.js";

import eventsRoutes from "./routes/eventsRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";

import advertisementRoutes from "./routes/advertisementRoutes.js";

import enrollmentRoutes from "./routes/enrollmentRoutes.js";



const app = express();
const port = process.env.PORT || 4000;


connectDB();


const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
];

// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      
      if (!origin) return callback(null, true);
      return allowedOrigins.includes(origin)
        ? callback(null, true)
        : callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => res.send("API Working"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);         
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/stripe", stripeRoutes);


app.use("/api/reviews", reviewsRoutes);
app.use("/api/reviews", reviewReportsRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/payments", paymentRoutes);

app.use("/api/services", servicesRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/appointments", appointmentsRoutes);

app.use("/api/transactions", transactionRoutes);


app.use("/api/packages", packagesRoutes);
app.use("/api/reports", serviceReportsRoutes);

app.use("/api/events", eventsRoutes);
app.use("/api/courses", courseRoutes);

app.use("/api/ads", advertisementRoutes);


app.use("/api/enrollments", enrollmentRoutes);


// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler 
app.use((err, req, res, next) => {
  console.error(err?.stack || err);
  res
    .status(500)
    .json({ success: false, message: err.message || "Server error" });
});

app.listen(port, () => console.log(`Server started on PORT:${port}`));
