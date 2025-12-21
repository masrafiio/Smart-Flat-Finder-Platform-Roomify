import mongoose from "mongoose";

const propertyReviewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("PropertyReview", propertyReviewSchema);
