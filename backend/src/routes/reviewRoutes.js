import express from "express";
import {
  createPropertyReview,
  getPropertyReviews,
  rateUser,
  getUserRatings,
  getMyRatingForUser,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Property Reviews (Comments) - Anyone can view, only authenticated can post
router.get("/property/:propertyId", getPropertyReviews);
router.post("/property", protect, createPropertyReview);

// User Ratings - Authenticated users can rate each other
router.post("/user", protect, rateUser);
router.get("/user/:userId", getUserRatings);
router.get("/user/:userId/my-rating", protect, getMyRatingForUser);

export default router;
