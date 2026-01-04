import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  suspendUser,
  unsuspendUser,
  deleteUser,
  updateAdminProfile,
} from "../controllers/adminController.js";
import {
  getAllPropertiesAdmin,
  getPendingVerifications,
  approveProperty,
  rejectProperty,
  deletePropertyAdmin,
  suspendProperty,
  unsuspendProperty,
} from "../controllers/propertyController.js";
import {
  getAllReports,
  updateReportStatus,
  deleteReport,
} from "../controllers/reportController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require admin authentication
router.use(protect, adminOnly);

// Dashboard
router.get("/dashboard/stats", getDashboardStats);

// User management
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserDetails);
router.put("/users/:userId/suspend", suspendUser);
router.put("/users/:userId/unsuspend", unsuspendUser);
router.delete("/users/:userId", deleteUser);

// Property management
router.get("/properties", getAllPropertiesAdmin);
router.get("/properties/pending", getPendingVerifications);
router.put("/properties/:propertyId/approve", approveProperty);
router.put("/properties/:propertyId/reject", rejectProperty);
router.put("/properties/:propertyId/suspend", suspendProperty);
router.put("/properties/:propertyId/unsuspend", unsuspendProperty);
router.delete("/properties/:propertyId", deletePropertyAdmin);

// Report management
router.get("/reports", getAllReports);
router.put("/reports/:reportId", updateReportStatus);
router.delete("/reports/:reportId", deleteReport);

// Profile
router.put("/profile", updateAdminProfile);

export default router;
