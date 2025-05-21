import mongoose from "mongoose";

const jobPostSchema = new mongoose.Schema(
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
    company: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    description: { 
      type: String,
      required: true 
    },
    requirements: {
      type: String,
      required: false
    },
    salary: {
      type: String,
      required: false
    },
    contactEmail: {
      type: String,
      required: false
    },
    applicationDeadline: {
      type: Date,
      required: false
    },
    status: {
      type: String,
      enum: ["active", "closed", "expired"],
      default: "active"
    },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "temporary"],
      required: true
    }
  },
  { timestamps: true }
);

// Indexes for efficient querying
jobPostSchema.index({ author: 1 });
jobPostSchema.index({ status: 1 });
jobPostSchema.index({ applicationDeadline: 1 });
jobPostSchema.index({ jobType: 1 });
jobPostSchema.index({ createdAt: -1 });

// Virtual field to check if job posting is expired
jobPostSchema.virtual('isExpired').get(function() {
  if (this.applicationDeadline) {
    return new Date() > this.applicationDeadline;
  }
  return false;
});

// Middleware to update expired job postings automatically
jobPostSchema.pre(['find', 'findOne'], async function() {
  try {
    // Update expired jobs before retrieval
    if (!this._conditions.status || this._conditions.status !== 'expired') {
      await mongoose.model('JobPost').updateMany(
        { 
          status: 'active',
          applicationDeadline: { $lt: new Date() }
        },
        { 
          $set: { status: 'expired' }
        }
      );
    }
  } catch (error) {
    console.error('Error updating expired job posts:', error);
  }
});

const JobPost = mongoose.model("JobPost", jobPostSchema);

export default JobPost;