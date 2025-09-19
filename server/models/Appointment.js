import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    code: { type: String, index: true }, 
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true }],
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true }, 
    date: { type: String, required: true, index: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "no_show"],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "processing", "paid", "failed", "refunded", "partially_refunded"],
      default: "unpaid",
      index: true,
    },
    paymentMode: { type: String, enum: ["online", "cash", "card_at_salon"], default: "online" },

    holdExpiresAt: { type: Date, default: null }, 
    notes: { type: String, default: "" },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);


appointmentSchema.pre("save", async function (next) {
  if (this.code) return next();
  const y = new Date().getFullYear();
  const seq = Math.floor(100000 + Math.random() * 900000);
  this.code = `APT-${y}-${seq}`;
  next();
});


appointmentSchema.statics.overlaps = async function ({ staff, startTime, endTime, excludeId = null }) {
  const q = {
    staff,
    status: { $in: ["pending", "confirmed"] }, 
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };
  if (excludeId) q._id = { $ne: excludeId };
  return this.countDocuments(q);
};

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
