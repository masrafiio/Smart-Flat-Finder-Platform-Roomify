import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true },
    description: { type: String, required: true },
    propertyType: {
      type: String,
      enum: ["room", "flat", "apartment"],
      required: true,
    },

    // Location
    address: {
      street: String,
      city: { type: String, required: true },
      state: String,
      zipCode: String,
      country: { type: String, default: "USA" },
    },
    googleMapsLink: { type: String, default: "" },
    googleMapsEmbedLink: { type: String, default: "" }, // Separate field for embed link

    // Pricing
    rent: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },

    // Room details
    totalRooms: { type: Number, required: true },
    availableRooms: { type: Number, required: true },

    amenities: [String],
    images: [String],

    // Current tenants - User references
    tenants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Current tenants info (for display purposes)
    currentTenants: [
      {
        name: String,
        gender: String,
        occupation: String,
      },
    ],

    // Availability
    availableFrom: Date,
    isAvailable: { type: Boolean, default: true },

    // Reviews
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    // Admin verification
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isPublished: { type: Boolean, default: false },
    rejectionReason: String,

    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Property", propertySchema);
