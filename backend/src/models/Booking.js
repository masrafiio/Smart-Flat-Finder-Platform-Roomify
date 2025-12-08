import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bookingType: { type: String, enum: ["booking", "visit"], required: true },

    // Visit slots
    proposedDate: Date,
    proposedTime: String,

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "completed"],
      default: "pending",
    },

    // Booking details
    moveInDate: Date,
    leaseDuration: Number,

    tenantNotes: String,
    landlordNotes: String,
    rejectionReason: String,
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
