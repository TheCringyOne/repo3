// backend/jobs/projectCleanup.js
import axios from "axios";
import ProjectPost from "../models/projectPost.model.js";
import cloudinary from "../lib/cloudinary.js";

/**
 * Function to clean up expired projects
 * This should be run on a schedule (e.g., daily)
 */
export const cleanupExpiredProjects = async () => {
    try {
        console.log("Running cleanup job for expired projects...");
        
        // Update the status of any expired projects
        const now = new Date();
        await ProjectPost.updateMany(
            { expirationDate: { $lt: now }, status: { $ne: "expired" } },
            { status: "expired" }
        );
        
        // Calculate threshold for deletion (7 days after expiration)
        const deleteThreshold = new Date();
        deleteThreshold.setDate(deleteThreshold.getDate() - 7);
        
        // Find projects to delete
        const projectsToDelete = await ProjectPost.find({
            status: "expired",
            expirationDate: { $lt: deleteThreshold }
        });
        
        console.log(`Found ${projectsToDelete.length} expired projects to delete.`);
        
        // Delete images from cloudinary
        for (const project of projectsToDelete) {
            if (project.image) {
                try {
                    const publicId = project.image.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                    console.log(`Deleted image for project ${project._id}`);
                } catch (error) {
                    console.error(`Error deleting image for project ${project._id}:`, error);
                }
            }
        }
        
        // Delete the projects from database
        const result = await ProjectPost.deleteMany({
            status: "expired",
            expirationDate: { $lt: deleteThreshold }
        });
        
        console.log(`Successfully deleted ${result.deletedCount} expired projects.`);
        
        return {
            success: true,
            deletedCount: result.deletedCount
        };
    } catch (error) {
        console.error("Error in project cleanup job:", error);
        return {
            success: false,
            error: error.message
        };
    }
};

// If you want to run this as a standalone script
if (process.env.NODE_ENV !== 'test') {
    // This can be called from a cron job or similar scheduled task
    // For example, using node-cron:
    // import cron from 'node-cron';
    // cron.schedule('0 0 * * *', cleanupExpiredProjects); // Run daily at midnight
}

export default cleanupExpiredProjects;