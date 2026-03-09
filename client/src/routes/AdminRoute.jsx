const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");

const {
  getDashboardStats,
  getAllUsers,
  getAllResumes,
  updateUserRole,
  deleteUser,
  getEnhancementHistory
} = require("../controllers/adminController");

// 🔐 All admin routes protected
router.use(authenticateToken, requireAdmin);

// Dashboard
router.get("/dashboard/stats", getDashboardStats);

// Users
router.get("/users", getAllUsers);
router.put("/users/:userId/role", updateUserRole);
router.delete("/users/:userId", deleteUser);

// Resumes
router.get("/resumes", getAllResumes);

// Enhancements
router.get("/enhancements", getEnhancementHistory);

module.exports = router;
