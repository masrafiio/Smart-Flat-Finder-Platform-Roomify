import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reportedItem: { type: mongoose.Schema.Types.ObjectId, required: true },
    itemType: {
      type: String,
      enum: ["user", "property", "forumPost"],
      required: true,
    },

    reason: {
      type: String,
      enum: [
        "spam",
        "fraud",
        "inappropriate_content",
        "harassment",
        "fake_listing",
        "other",
      ],
      default: "other",
    },
    description: String,

    status: {
      type: String,
      enum: ["pending", "under_review", "resolved", "dismissed"],
      default: "pending",
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminNotes: String,
    actionTaken: String,
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
