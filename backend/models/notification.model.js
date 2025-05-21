// backend/models/notification.model.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: [
                "like", 
                "comment", 
                "connectionAccepted",
                "projectInterest",   // New type for project interest
                "projectComment",    // New type for project comments
                "projectLike",       // New type for project likes
                "projectExpired"     // New type for expired projects
            ],
        },
        relatedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        relatedPost: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
        relatedProject: {           // New field for project-related notifications
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProjectPost",
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;