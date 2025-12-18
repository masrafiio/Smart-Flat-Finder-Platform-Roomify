import express from "express";
import { createReport } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create report (any authenticated user)
router.post("/", protect, createReport);

export default router;
