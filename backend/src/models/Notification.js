import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },

    relatedProperty: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },

    isRead: { type: Boolean, default: false },
    isEmailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
