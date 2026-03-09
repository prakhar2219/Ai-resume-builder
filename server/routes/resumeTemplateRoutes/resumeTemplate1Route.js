const express = require("express");
const router = express.Router();

// Example resume template route
router.get("/", (req, res) => {
  res.json({ success: true, message: "Resume Template 1 route working" });
});

module.exports = router;