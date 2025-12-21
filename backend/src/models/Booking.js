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

    // Visit slots (for visit type)
    proposedDate: Date,
    approvedVisitTime: String, // Time selected by landlord when accepting (9am-5pm)

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "completed",
        "active",
      ],
      default: "pending",
    },

    // Booking details (for booking type)
    moveInDate: Date,

    // Property status for active bookings
    propertyStatus: {
      type: String,
      enum: ["active", "left"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
