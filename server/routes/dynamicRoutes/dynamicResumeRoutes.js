const express = require("express");
const router = express.Router();

// Example dynamic resume route
router.get("/", (req, res) => {
  res.json({ success: true, message: "Dynamic resume route working" });
});

module.exports = router;