import React from "react";

const Dashboard = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        change={stats.recentUsers}
        label="New (30 days)"
        icon="👥"
      />
      <StatCard
        title="Total Resumes"
        value={stats.totalResumes}
        change={stats.recentResumes}
        label="New (30 days)"
        icon="📄"
      />
      <StatCard
        title="AI Enhancements"
        value={stats.totalEnhancements}
        icon="✨"
      />
    </div>
  );
};

const StatCard = ({ title, value, change, label, icon }) => (
  <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
    <div className="flex justify-between items-center mb-3">
      <h3 className="text-gray-400 uppercase text-sm">{title}</h3>
      <span className="text-3xl">{icon}</span>
    </div>
    <div className="text-3xl font-bold">{value}</div>
    {change !== undefined && (
      <div className="text-teal-400 text-sm mt-1">
        +{change} {label}
      </div>
    )}
  </div>
);

export default Dashboard;
