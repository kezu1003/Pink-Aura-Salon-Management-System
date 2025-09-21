import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URL;
  const dbName = process.env.DB_NAME || "Pink-Aura-Salon-Management-System";

  if (!uri) {
    throw new Error("MONGODB_URL is missing in .env");
  }

  try {
    await mongoose.connect(uri, {
      dbName,
      
    });

    mongoose.connection.on("connected", () =>
      console.log(`Database Connected (dbName: ${dbName})`)
    );
    mongoose.connection.on("error", (err) =>
      console.error("MongoDB connection error:", err)
    );
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
};

export default connectDB;
