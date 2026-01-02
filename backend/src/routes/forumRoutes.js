import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAllPosts,
  createPost,
  deletePost,
  addComment,
} from "../controllers/forumController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all forum posts
router.get("/", getAllPosts);

// Create a new forum post
router.post("/", createPost);

// Delete a forum post
router.delete("/:id", deletePost);

// Add a comment to a post
router.post("/:id/comment", addComment);

export default router;
