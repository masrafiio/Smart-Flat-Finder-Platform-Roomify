import mongoose from "mongoose";

const userReviewSchema = new mongoose.Schema(
  {
    reviewedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    relatedProperty: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },

    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    reviewerRole: {
      type: String,
      enum: ["landlord", "tenant"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserReview", userReviewSchema);
