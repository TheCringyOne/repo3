import mongoose from "mongoose";

const bannedUserSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      default: ""
    },
    bannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    bannedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const BannedUser = mongoose.model("BannedUser", bannedUserSchema);
export default BannedUser;