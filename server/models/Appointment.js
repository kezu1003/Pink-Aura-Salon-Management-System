import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },       // 
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true, index: true },

    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },

    status: {
      type: String,
      enum: ["booked", "confirmed", "rescheduled", "completed", "cancelled"],
      default: "booked",
      index: true,
    },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

appointmentSchema.index({ staff: 1, startTime: 1 });
appointmentSchema.index({ customer: 1, startTime: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
