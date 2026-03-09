// src/components/admin/Topbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Topbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold">Admin Dashboard</h2>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{user?.name || "Admin"}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm rounded bg-red-600 hover:bg-red-500 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
