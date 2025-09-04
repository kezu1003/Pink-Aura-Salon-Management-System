import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },

    // Email verification / reset
    verifyOtp: { type: String, default: "" },
    verifyOtpExpireAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    resetOtp: { type: String, default: "" },
    resetOtpExpireAt: { type: Number, default: 0 },

    jobTitle: {
      type: String,
      enum: [
        "Facial Artist",
        "Hair dresser",
        "Nail Artist",
        "Makeup Artist",
        "Event Stylist",
        "" 
      ],
      default: "",
      index: true,
    },

    role: {
      type: String,
      enum: ["customer", "staff", "admin", "supplier"],
      default: "customer",
      index: true
    },
    status: { type: String, enum: ["active", "suspended"], default: "active", index: true },

    
    permissions: { type: [String], default: [] },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;
