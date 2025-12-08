import mongoose from "mongoose";

const forumPostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    postType: { type: String, enum: ["offering", "seeking"], required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },

    // Location
    city: String,
    area: String,

    // Budget
    budgetMin: Number,
    budgetMax: Number,

    propertyType: { type: String, enum: ["room", "flat", "apartment"] },
    moveInDate: Date,

    // Comments
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("ForumPost", forumPostSchema);
