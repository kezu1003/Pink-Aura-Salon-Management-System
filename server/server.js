import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import http from "http";

import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import productRoutes from "./routes/productsRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import { initIO } from "./sockets/io.js"; 

const app = express();
const port = process.env.PORT || 4000;
connectDB();

const allowedOrigins = ["http://localhost:5173"];

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// API endpoints
app.get("/", (req, res) => res.send("API Working "));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/products", productRoutes);
app.use("/api/checkout", checkoutRoutes);

// --- wrap with HTTP server for Socket.IO ---
const server = http.createServer(app);
initIO(server, { origin: allowedOrigins, credentials: true });

// start server
server.listen(port, () => console.log(`Server started on PORT:${port}`));
