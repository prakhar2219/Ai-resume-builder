import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import { toast } from 'react-toastify';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Wait until global auth check completes
      if (authLoading) {
        return;
      }

      if (!isAuthenticated) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Try to fetch admin dashboard stats - if successful, user is admin
        await adminService.getDashboardStats();
        setIsAdmin(true);
      } catch (error) {
        setIsAdmin(false);
        if (error.message.includes('Admin access required')) {
          toast.error('Admin access required');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [isAuthenticated, authLoading]);

  // Show loader while either global auth or local admin check is running
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminProtectedRoute;

