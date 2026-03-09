const express = require("express");
const router = express.Router();
const { enhanceSection } = require("../controllers/geminiController");

// Gemini AI enhancement route
router.post("/", enhanceSection);

module.exports = router;