import express from "express";
import {
  getLandlordProfile,
  updateLandlordProfile,
  getLandlordProperties,
  getLandlordStats,
} from "../controllers/landlordController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected and restricted to landlords
router.use(protect);
router.use(authorize("landlord"));

// Profile routes
router.get("/profile", getLandlordProfile);
router.put("/profile", updateLandlordProfile);

// Property routes
router.get("/properties", getLandlordProperties);

// Stats routes
router.get("/stats", getLandlordStats);

export default router;
