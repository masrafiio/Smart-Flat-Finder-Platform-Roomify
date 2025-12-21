import PropertyReview from "../models/PropertyReview.js";
import UserReview from "../models/UserReview.js";
import Property from "../models/Property.js";
import User from "../models/User.js";

// ============ PROPERTY REVIEWS (Comments only) ============

// Post a comment on a property
export const createPropertyReview = async (req, res) => {
  try {
    const { propertyId, comment } = req.body;

    if (!propertyId || !comment || comment.trim() === "") {
      return res
        .status(400)
        .json({ message: "Property ID and comment are required" });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const review = await PropertyReview.create({
      property: propertyId,
      reviewer: req.user._id,
      comment: comment.trim(),
    });

    await review.populate("reviewer", "name email profilePicture");

    res.status(201).json({
      message: "Comment posted successfully",
      review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all comments for a property
export const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const reviews = await PropertyReview.find({ property: propertyId })
      .populate("reviewer", "name email profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============ USER RATINGS (Landlord ↔ Tenant) ============

// Rate a user (landlord rates tenant or tenant rates landlord)
export const rateUser = async (req, res) => {
  try {
    const { userId, rating, comment, propertyId } = req.body;

    // Validation
    if (!userId || !rating) {
      return res
        .status(400)
        .json({ message: "User ID and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Cannot rate yourself
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot rate yourself" });
    }

    // Check if rated user exists
    const ratedUser = await User.findById(userId);
    if (!ratedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check role compatibility (landlord can rate tenant and vice versa)
    if (req.user.role === ratedUser.role) {
      return res.status(400).json({
        message:
          "You can only rate users of different roles (landlord ↔ tenant)",
      });
    }

    // Check if rating already exists
    let existingRating = await UserReview.findOne({
      reviewedUser: userId,
      reviewer: req.user._id,
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      if (comment !== undefined) existingRating.comment = comment;
      if (propertyId) existingRating.relatedProperty = propertyId;
      await existingRating.save();

      await existingRating.populate("reviewer", "name email");

      // Update user's average rating
      await updateUserAverageRating(userId);

      return res.status(200).json({
        message: "Rating updated successfully",
        rating: existingRating,
      });
    }

    // Create new rating
    const newRating = await UserReview.create({
      reviewedUser: userId,
      reviewer: req.user._id,
      rating,
      comment: comment || "",
      reviewerRole: req.user.role,
      relatedProperty: propertyId || null,
    });

    await newRating.populate("reviewer", "name email");

    // Update user's average rating
    await updateUserAverageRating(userId);

    res.status(201).json({
      message: "Rating submitted successfully",
      rating: newRating,
    });
  } catch (error) {
    console.error("Error rating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all ratings for a user
export const getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;

    const ratings = await UserReview.find({ reviewedUser: userId })
      .populate("reviewer", "name email profilePicture role")
      .populate("relatedProperty", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    console.error("Error fetching user ratings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get my rating for a specific user
export const getMyRatingForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const rating = await UserReview.findOne({
      reviewedUser: userId,
      reviewer: req.user._id,
    }).populate("reviewer", "name email");

    if (!rating) {
      return res.status(404).json({ message: "No rating found" });
    }

    res.status(200).json(rating);
  } catch (error) {
    console.error("Error fetching rating:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper function to update user's average rating
const updateUserAverageRating = async (userId) => {
  try {
    const allRatings = await UserReview.find({ reviewedUser: userId });
    const user = await User.findById(userId);

    if (allRatings.length > 0) {
      const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0);
      user.averageRating = totalRating / allRatings.length;
      user.totalRatings = allRatings.length;
    } else {
      user.averageRating = 0;
      user.totalRatings = 0;
    }

    await user.save();
  } catch (error) {
    console.error("Error updating user average rating:", error);
  }
};
