import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import adminService from "../services/adminService";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/Admin/AdminLayout.jsx";

// 👇 Admin sections
import Dashboard from "./Admin/Dashboard";
import Users from "./Admin/Users";
import Resumes from "./Admin/Resumes";
// (Enhancements baad me add ho jayega)

const AdminPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [enhancements, setEnhancements] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // 🔐 Auth check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadDashboardStats();
  }, [isAuthenticated, navigate]);

  // ---------- API CALLS ----------
  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboardStats();
      if (res && res.data) {
        setDashboardStats(res.data);
      } else {
        setDashboardStats(null);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load dashboard");
      if (err.message?.includes("Admin access")) navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers(page, pagination.limit);
      setUsers(res.data.users || []);
      setPagination(res.data.pagination || pagination);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadResumes = async (page = 1) => {
    try {
      setLoading(true);
      const res = await adminService.getAllResumes(page, pagination.limit);
      setResumes(res.data.resumes || []);
      setPagination(res.data.pagination || pagination);
    } catch (err) {
      toast.error("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  };

  const loadEnhancements = async (page = 1) => {
    try {
      setLoading(true);
      const res = await adminService.getEnhancementHistory(page, 20);
      setEnhancements(res.data.enhancements || []);
      setPagination(res.data.pagination || pagination);
    } catch (err) {
      toast.error("Failed to load enhancements");
    } finally {
      setLoading(false);
    }
  };

  // ---------- HANDLERS ----------
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "users") loadUsers();
    if (tab === "resumes") loadResumes();
    if (tab === "enhancements") loadEnhancements();
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await adminService.updateUserRole(userId, role);
      toast.success("Role updated");
      loadUsers(pagination.page);
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user ${name}?`)) return;
    try {
      await adminService.deleteUser(id);
      toast.success("User deleted");
      loadUsers(pagination.page);
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading && !dashboardStats) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading Admin Dashboard...
      </div>
    );
  }

  // ---------- UI ----------
  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-orange-500 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-400">
          Manage users, resumes, and system statistics
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-700">
        {["dashboard", "users", "resumes", "enhancements"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-6 py-3 capitalize ${
              activeTab === tab
                ? "border-b-2 border-teal-500 text-teal-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {activeTab === "dashboard" && <Dashboard stats={dashboardStats} />}

      {activeTab === "users" && (
        <Users
          users={users}
          pagination={pagination}
          onRoleChange={handleRoleChange}
          onDelete={handleDeleteUser}
          onPageChange={loadUsers}
        />
      )}

      {activeTab === "resumes" && (
        <Resumes
          resumes={resumes}
          pagination={pagination}
          onPageChange={loadResumes}
        />
      )}

      {activeTab === "enhancements" && (
        <div className="text-gray-400">Enhancements section coming soon...</div>
      )}
    </AdminLayout>
  );
};

export default AdminPage;