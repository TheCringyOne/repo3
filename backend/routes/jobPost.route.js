import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import {
  getJobPosts,
  createJobPost,
  getJobPostById,
  updateJobPost,
  deleteJobPost,
  changeJobStatus
} from "../controllers/jobPost.controller.js";

const router = express.Router();

// Get all job posts (accessible to students and admins)
router.get("/", protectRoute, getJobPosts);

// Get a specific job post by ID
router.get("/:id", protectRoute, getJobPostById);

// Create a new job post (admin only)
router.post("/create", protectRoute, isAdmin, createJobPost);

// Update a job post (admin only)
router.put("/:id", protectRoute, isAdmin, updateJobPost);

// Delete a job post (admin only)
router.delete("/:id", protectRoute, isAdmin, deleteJobPost);

// Change job post status (admin only)
router.patch("/:id/status", protectRoute, isAdmin, changeJobStatus);

export default router;