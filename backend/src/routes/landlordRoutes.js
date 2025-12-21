import express from "express";
import {
  getLandlordProfile,
  updateLandlordProfile,
  getLandlordProperties,
  getLandlordStats,
  getLandlordPropertiesById,
} from "../controllers/landlordController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected and restricted to landlords
router.use(protect);

// Profile routes
router.get("/profile", authorize("landlord"), getLandlordProfile);
router.put("/profile", authorize("landlord"), updateLandlordProfile);

// Property routes
router.get("/properties", authorize("landlord"), getLandlordProperties);
router.get("/properties/:userId", getLandlordPropertiesById);

// Stats routes
router.get("/stats", authorize("landlord"), getLandlordStats);

export default router;
