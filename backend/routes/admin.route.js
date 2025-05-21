// backend/routes/admin.route.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { createUser, getAllUsers, updateUserRole, deleteUser, resetUserPassword } from "../controllers/admin.controller.js";
import { 
  banUser,
  getBannedUsers,
  unbanUser
} from "../controllers/admin.controller.js";




const router = express.Router();

router.post("/users", protectRoute, isAdmin, createUser);
router.get("/users", protectRoute, isAdmin, getAllUsers);
router.put("/users/:id/role", protectRoute, isAdmin, updateUserRole);
router.delete("/users/:id", protectRoute, isAdmin, deleteUser);

// New ban routes
router.post("/users/:userId/ban", protectRoute, isAdmin, banUser);
router.get("/banned-users", protectRoute, isAdmin, getBannedUsers);
router.delete("/banned-users/:studentId", protectRoute, isAdmin, unbanUser);

router.post("/users/:id/reset-password", protectRoute, isAdmin, resetUserPassword);

export default router;