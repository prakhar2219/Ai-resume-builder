// services/adminApi.js
import authService from "./authService";

const BASE = "http://localhost:5000/api/admin";

/* ================= DASHBOARD ================= */

// Get overall stats for admin dashboard
export async function getDashboardStats() {
  const res = await authService.authenticatedRequest(`${BASE}/dashboard/stats`);
  return res.json();
}

/* ================= USERS ================= */

// Get all users
export async function getAllUsers() {
  const res = await authService.authenticatedRequest(`${BASE}/users`);
  return res.json();
}

// Update user role
export async function updateUserRole(userId, role) {
  const res = await authService.authenticatedRequest(`${BASE}/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
  return res.json();
}

// Delete user
export async function deleteUser(userId) {
  const res = await authService.authenticatedRequest(`${BASE}/users/${userId}`, {
    method: "DELETE",
  });
  return res.json();
}

/* ================= RESUMES ================= */

// Get all resumes
export async function getAllResumes() {
  const res = await authService.authenticatedRequest(`${BASE}/resumes`);
  return res.json();
}

/* ================= ENHANCEMENTS ================= */

// Get enhancement history
export async function getEnhancementHistory() {
  const res = await authService.authenticatedRequest(`${BASE}/enhancements`);
  return res.json();
}