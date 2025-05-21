// backend/models/projectPost.model.js
import mongoose from "mongoose";

const projectPostSchema = new mongoose.Schema(
    {
        author: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        title: { 
            type: String, 
            required: true 
        },
        content: { 
            type: String, 
            required: true 
        },
        image: { 
            type: String 
        },
        likes: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        }],
        comments: [
            {
                content: { type: String },
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        interestedUsers: [
            {
                user: { 
                    type: mongoose.Schema.Types.ObjectId, 
                    ref: "User" 
                },
                createdAt: { 
                    type: Date, 
                    default: Date.now 
                },
            },
        ],
        expirationDate: {
            type: Date,
            default: function() {
                // Default to 30 days from creation
                const date = new Date();
                date.setDate(date.getDate() + 30);
                return date;
            },
            required: true
        },
        status: {
            type: String,
            enum: ["active", "completed", "expired"],
            default: "active"
        },
        projectRequirements: { 
            type: String 
        },
        projectGoals: { 
            type: String 
        }
    },
    { timestamps: true }
);

// Index to help with finding expired projects
projectPostSchema.index({ expirationDate: 1 });
projectPostSchema.index({ status: 1 });
projectPostSchema.index({ author: 1 });

// Virtual field to check if project is expired
projectPostSchema.virtual('isExpired').get(function() {
    return new Date() > this.expirationDate;
});

// Middleware to automatically mark projects as expired
projectPostSchema.pre(['find', 'findOne'], async function(next) {
    try {
        // Only update if we're not specifically querying expired projects
        if (!this._conditions.status || this._conditions.status !== 'expired') {
            await mongoose.model('ProjectPost').updateMany(
                { 
                    status: 'active',
                    expirationDate: { $lt: new Date() }
                },
                { 
                    $set: { status: 'expired' }
                }
            );
        }
        next();
    } catch (error) {
        next(error);
    }
});

const ProjectPost = mongoose.model("ProjectPost", projectPostSchema);

export default ProjectPost;