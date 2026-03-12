const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { connectToPostgreSQL } = require("./config/database");
const { errorHandler } = require("./utils/errorHandler");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const normalizeOrigin = (value) => {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const configuredOrigins = [
  "http://localhost:5173",
  "http://localhost:5180",
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
]
  .map(normalizeOrigin)
  .filter(Boolean);

const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS !== "false";

const isAllowedOrigin = (origin) => {
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return false;

  if (configuredOrigins.includes(normalizedOrigin)) {
    return true;
  }

  if (allowVercelPreviews) {
    try {
      const { hostname, protocol } = new URL(normalizedOrigin);
      return protocol === "https:" && hostname.endsWith(".vercel.app");
    } catch {
      return false;
    }
  }

  return false;
};

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (isAllowedOrigin(origin) || configuredOrigins.length === 0) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Import routes
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const geminiRoutes = require("./routes/geminiRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const atsRoutes = require("./routes/atsRoutes");

// Register API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/enhance", geminiRoutes);
app.use("/api/ats", atsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Error handling
app.use(errorHandler);

// Start server or export for Vercel
async function startServer() {
  try {
    const isConnected = await connectToPostgreSQL();
    if (!isConnected) {
      console.error("❌ Failed to connect to PostgreSQL");
      // Skip exit in serverless environments to allow further retries
      if (!process.env.VERCEL) process.exit(1);
    }
    
    // Render and local development both need a long-running HTTP server.
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    if (!process.env.VERCEL) process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error(" Uncaught Exception:", error);
  if (!process.env.VERCEL) process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error(" Unhandled Rejection:", error);
  if (!process.env.VERCEL) process.exit(1);
});

// Initialize database connection
startServer();

// Export the Express API for Vercel
module.exports = app;
