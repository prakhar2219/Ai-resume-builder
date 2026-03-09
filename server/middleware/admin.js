const { pool } = require("../config/database");

// ✅ Admin authorization middleware
const requireAdmin = async (req, res, next) => {
  try {
    // 🔐 Step 1: user must be authenticated
    // (authenticateToken middleware se req.user aata hai)
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // 🔍 Step 2: get user from DB
    const result = await pool.query(
      "SELECT id, email, role FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    const user = result.rows[0];

    // 🛑 Step 3: check admin role
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }

    // ✅ Step 4: attach admin user
    req.user = user;
    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({
      success: false,
      error: "Admin verification failed",
    });
  }
};

module.exports = { requireAdmin };
