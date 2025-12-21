import express from "express";
import {
  createBookingRequest,
  getMyBookings,
  getMyCurrentProperty,
  getLandlordBookings,
  getPropertyBookings,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  leaveProperty,
} from "../controllers/bookingController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tenant routes
router.post("/create", protect, authorize("tenant"), createBookingRequest);
router.get("/my-bookings", protect, authorize("tenant"), getMyBookings);
router.get("/my-property", protect, authorize("tenant"), getMyCurrentProperty);
router.put("/:bookingId/cancel", protect, authorize("tenant"), cancelBooking);
router.post("/leave-property", protect, authorize("tenant"), leaveProperty);

// Landlord routes
router.get(
  "/landlord/all",
  protect,
  authorize("landlord"),
  getLandlordBookings
);
router.get(
  "/property/:propertyId",
  protect,
  authorize("landlord"),
  getPropertyBookings
);
router.put("/:bookingId/accept", protect, authorize("landlord"), acceptBooking);
router.put("/:bookingId/reject", protect, authorize("landlord"), rejectBooking);

export default router;
