// backend/controllers/project.controller.js
import cloudinary from "../lib/cloudinary.js";
import ProjectPost from "../models/projectPost.model.js";
import Notification from "../models/notification.model.js";
import mongoose from "mongoose";

// Update expired projects helper
const updateExpiredProjects = async () => {
    const now = new Date();
    await ProjectPost.updateMany(
        { expirationDate: { $lt: now }, status: "active" },
        { status: "expired" }
    );
};

// Get all projects
export const getProjects = async (req, res) => {
    try {
        const { status, interested, created } = req.query;
        const userId = req.user._id;
        
        let query = {};
        
        // Filter by status if provided
        if (status) {
            query.status = status;
        }
        
        // Filter projects the user is interested in
        if (interested === "true") {
            query["interestedUsers.user"] = userId;
        }
        
        // Filter projects created by the user
        if (created === "true") {
            query.author = userId;
        }
        
        const projects = await ProjectPost.find(query)
            .populate("author", "name username profilePicture headline")
            .populate("comments.user", "name profilePicture")
            .populate("interestedUsers.user", "name username profilePicture headline")
            .sort({ createdAt: -1 });
        
        // Convert Mongoose documents to plain objects
        const plainProjects = projects.map(project => project.toObject());
        
        res.status(200).json(plainProjects);
    } catch (error) {
        console.error("Error in getProjects controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Create a new project post
export const createProject = async (req, res) => {
    try {
        const { title, content, image, projectRequirements, projectGoals, expirationDays } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }
        
        // Calculate expiration date
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + (parseInt(expirationDays) || 30));
        
        let newProject;
        
        if (image) {
            const imgResult = await cloudinary.uploader.upload(image);
            newProject = new ProjectPost({
                author: req.user._id,
                title,
                content,
                image: imgResult.secure_url,
                projectRequirements,
                projectGoals,
                expirationDate
            });
        } else {
            newProject = new ProjectPost({
                author: req.user._id,
                title,
                content,
                projectRequirements,
                projectGoals,
                expirationDate
            });
        }
        
        await newProject.save();
        
        // Return as plain object
        res.status(201).json(newProject.toObject());
    } catch (error) {
        console.error("Error in createProject controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get project by ID
export const getProjectById = async (req, res) => {
    try {
        const projectId = req.params.id;
        
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: "Invalid project ID" });
        }
        
        const project = await ProjectPost.findById(projectId)
            .populate("author", "name username profilePicture headline")
            .populate("comments.user", "name profilePicture username headline")
            .populate("interestedUsers.user", "name username profilePicture headline");
        
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        
        // Return as plain object
        res.status(200).json(project.toObject());
    } catch (error) {
        console.error("Error in getProjectById controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update project
export const updateProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const { title, content, projectRequirements, projectGoals, status, expirationDays } = req.body;
        
        const project = await ProjectPost.findById(projectId);
        
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        
        if (project.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this project" });
        }
        
        if (title) project.title = title;
        if (content) project.content = content;
        if (projectRequirements) project.projectRequirements = projectRequirements;
        if (projectGoals) project.projectGoals = projectGoals;
        if (status) project.status = status;
        
        if (expirationDays) {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + parseInt(expirationDays));
            project.expirationDate = expirationDate;
        }
        
        await project.save();
        
        // Return as plain object
        res.status(200).json(project.toObject());
    } catch (error) {
        console.error("Error in updateProject controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete project
export const deleteProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        
        const project = await ProjectPost.findById(projectId);
        
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        
        if (project.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this project" });
        }
        
        if (project.image) {
            const publicId = project.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }
        
        await ProjectPost.findByIdAndDelete(projectId);
        
        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error in deleteProject controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Toggle interest in project
export const toggleInterestInProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const userId = req.user._id;
        
        const project = await ProjectPost.findById(projectId);
        
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        
        if (project.status === "expired") {
            return res.status(400).json({ message: "Cannot show interest in an expired project" });
        }
        
        const isInterested = project.interestedUsers.some(
            interest => interest.user.toString() === userId.toString()
        );
        
        if (isInterested) {
            project.interestedUsers = project.interestedUsers.filter(
                interest => interest.user.toString() !== userId.toString()
            );
        } else {
            project.interestedUsers.push({ user: userId });
            
            if (project.author.toString() !== userId.toString()) {
                const notification = new Notification({
                    recipient: project.author,
                    type: "projectInterest",
                    relatedUser: userId,
                    relatedProject: projectId
                });
                await notification.save();
            }
        }
        
        await project.save();
        
        res.status(200).json({
            message: isInterested ? "Interest removed" : "Interest added",
            project: project.toObject()
        });
    } catch (error) {
        console.error("Error in toggleInterestInProject controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Add comment to project
export const addCommentToProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({ message: "Comment content is required" });
        }
        
        const project = await ProjectPost.findById(projectId);
        
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        
        if (project.status === "expired") {
            return res.status(400).json({ message: "Cannot comment on an expired project" });
        }
        
        project.comments.push({
            user: req.user._id,
            content
        });
        
        await project.save();
        
        // Create notification for project author
        if (project.author.toString() !== req.user._id.toString()) {
            const notification = new Notification({
                recipient: project.author,
                type: "projectComment",
                relatedUser: req.user._id,
                relatedProject: projectId
            });
            await notification.save();
        }
        
        // Return as plain object
        res.status(200).json(project.toObject());
    } catch (error) {
        console.error("Error in addCommentToProject controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Like project
export const likeProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const userId = req.user._id;
        
        const project = await ProjectPost.findById(projectId);
        
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        
        if (project.status === "expired") {
            return res.status(400).json({ message: "Cannot like an expired project" });
        }
        
        const isLiked = project.likes.includes(userId);
        
        if (isLiked) {
            project.likes = project.likes.filter(id => id.toString() !== userId.toString());
        } else {
            project.likes.push(userId);
            
            if (project.author.toString() !== userId.toString()) {
                const notification = new Notification({
                    recipient: project.author,
                    type: "projectLike",
                    relatedUser: userId,
                    relatedProject: projectId
                });
                await notification.save();
            }
        }
        
        await project.save();
        
        // Return as plain object
        res.status(200).json(project.toObject());
    } catch (error) {
        console.error("Error in likeProject controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};