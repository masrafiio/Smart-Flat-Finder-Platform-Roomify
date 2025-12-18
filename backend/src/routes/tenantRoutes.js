import express from "express";
import {
  getTenantProfile,
  updateTenantProfile,
  getTenantBookings,
  getTenantWishlist,
  addToWishlist,
  removeFromWishlist,
  getViewedProperties,
} from "../controllers/tenantController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected and require authentication
router.get("/profile", protect, getTenantProfile);
router.put("/profile", protect, updateTenantProfile);
router.get("/bookings", protect, getTenantBookings);
router.get("/wishlist", protect, getTenantWishlist);
router.post("/wishlist", protect, addToWishlist);
router.delete("/wishlist/:propertyId", protect, removeFromWishlist);
router.get("/viewed-properties", protect, getViewedProperties);

export default router;
