import express from "express";
import {
  createProperty,
  updateProperty,
  deleteProperty,
  getProperty,
  getAllProperties,
  addCurrentTenant,
  removeCurrentTenant,
} from "../controllers/propertyController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllProperties);
router.get("/:id", getProperty);

// Protected routes (landlords only)
router.post("/", protect, authorize("landlord"), createProperty);
router.put("/:id", protect, authorize("landlord"), updateProperty);
router.delete("/:id", protect, authorize("landlord"), deleteProperty);

// Tenant management routes
router.post("/:id/tenants", protect, authorize("landlord"), addCurrentTenant);
router.delete(
  "/:id/tenants/:tenantId",
  protect,
  authorize("landlord"),
  removeCurrentTenant
);

export default router;
