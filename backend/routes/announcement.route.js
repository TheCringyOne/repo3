import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
} from "../controllers/announcement.controller.js";

const router = express.Router();

// Get all announcements (accessible to students and admins)
router.get("/", protectRoute, getAnnouncements);

// Create a new announcement (admin only)
router.post("/create", protectRoute, isAdmin, createAnnouncement);

// Delete an announcement (admin only)
router.delete("/:id", protectRoute, isAdmin, deleteAnnouncement);

export default router;