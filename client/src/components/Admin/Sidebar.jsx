// src/components/admin/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menu = [
    { name: "Dashboard", path: "/admin" },
    { name: "Users", path: "/admin?tab=users" },
    { name: "Resumes", path: "/admin?tab=resumes" },
    { name: "Enhancements", path: "/admin?tab=enhancements" },
  ];

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 hidden md:flex flex-col">
      <div className="px-6 py-5 text-2xl font-bold bg-gradient-to-r from-teal-400 to-orange-500 bg-clip-text text-transparent">
        Admin Panel
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-lg transition ${
                isActive
                  ? "bg-teal-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-700 text-sm text-gray-400">
        © AI Resume Builder
      </div>
    </aside>
  );
};

export default Sidebar;
