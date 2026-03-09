const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
  getUserResumes,
  createResume,
  getResume,
  updateResume,
  deleteResume,
  getUserSuggestions,
} = require("../controllers/resumeController");

// ⚙️ Resume routes

// Get all resumes for logged-in user (with pagination support)
router.get("/my-resumes", authenticateToken, getUserResumes);

// Get suggestions based on user's previous resumes
// Keep this BEFORE "/:id" to avoid route conflicts
router.get("/suggestions", authenticateToken, getUserSuggestions);

// Create new resume
router.post("/", authenticateToken, createResume);

// Get single resume by ID
router.get("/:id", authenticateToken, getResume);

// Update existing resume
router.put("/:id", authenticateToken, updateResume);

// Soft delete resume
router.delete("/:id", authenticateToken, deleteResume);

module.exports = router;