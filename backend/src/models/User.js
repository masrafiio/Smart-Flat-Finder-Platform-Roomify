import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "landlord", "tenant"],
      required: true,
    },

    // Profile
    phone: String,
    profilePicture: String,
    gender: { type: String, enum: ["male", "female", "other"] },
    occupation: String,
    dateOfBirth: Date,
    bio: String,

    // Rating for landlord/tenant reviews
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },

    // Tenant features
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
    viewedProperties: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    ],

    // Moderation
    isSuspended: { type: Boolean, default: false },
    suspendedUntil: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

export default mongoose.model("User", userSchema);
