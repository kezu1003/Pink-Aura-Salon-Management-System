import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },

  // Email verification / reset (existing)
  verifyOtp: { type: String, default: "" },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: "" },
  resetOtpExpireAt: { type: Number, default: 0 },

  // ✅ Staff specialization (job title)
  jobTitle: {
    type: String,
    enum: [
      "Facial Artist",
      "Hairdresser",
      "Nail Artist",
      "Makeup Artist",
      "Event Stylist",
      "" // allow empty for non-staff/admin users
    ],
    default: "",
    index: true,
  },

  // RBAC fields (non-breaking defaults)
  role: { type: String, enum: ["customer", "staff", "admin"], default: "customer", index: true },
  status: { type: String, enum: ["active", "suspended"], default: "active", index: true },
  permissions: { type: [String], default: [] },

  lastLoginAt: { type: Date },
}, { timestamps: true });

const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;
