// backend/routes/project.route.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    getProjects,
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    toggleInterestInProject,
    addCommentToProject,
    likeProject
} from "../controllers/project.controller.js";

const router = express.Router();

// Get all projects (with filtering options)
router.get("/", protectRoute, getProjects);

// Create a new project
router.post("/create", protectRoute, createProject);

// Get a specific project
router.get("/:id", protectRoute, getProjectById);

// Update a project
router.put("/:id", protectRoute, updateProject);

// Delete a project
router.delete("/:id", protectRoute, deleteProject);

// Toggle interest in a project
router.post("/:id/interest", protectRoute, toggleInterestInProject);

// Add a comment to a project
router.post("/:id/comment", protectRoute, addCommentToProject);

// Like a project
router.post("/:id/like", protectRoute, likeProject);

export default router;