// Admin service for admin API calls
const API_BASE = 'http://localhost:5000/api';

class AdminService {
  // Get auth token
  getToken() {
    return localStorage.getItem('auth_token');
  }

  // Make authenticated admin API request
  async adminRequest(endpoint, options = {}) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No authentication token');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      cache: 'no-store', // avoid 304 so we always get fresh JSON
    });

    if (response.status === 401 || response.status === 403) {
      // Unauthorized or Forbidden - redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      throw new Error('Admin access required');
    }

    // Safely parse JSON (304/204 may have empty body)
    let data = null;
    try {
      if (response.status !== 204 && response.status !== 304) {
        data = await response.json();
      }
    } catch (e) {
      data = null;
    }

    // Treat 304 Not Modified as success (use cached data in browser)
    if (!response.ok && response.status !== 304) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Get dashboard statistics
  async getDashboardStats() {
    return this.adminRequest('/admin/dashboard/stats');
  }

  // Get all users
  async getAllUsers(page = 1, limit = 10) {
    return this.adminRequest(`/admin/users?page=${page}&limit=${limit}`);
  }

  // Get all resumes
  async getAllResumes(page = 1, limit = 10) {
    return this.adminRequest(`/admin/resumes?page=${page}&limit=${limit}`);
  }

  // Update user role
  async updateUserRole(userId, role) {
    return this.adminRequest(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  // Delete user
  async deleteUser(userId) {
    return this.adminRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Get enhancement history
  async getEnhancementHistory(page = 1, limit = 20) {
    return this.adminRequest(`/admin/enhancements?page=${page}&limit=${limit}`);
  }
}

// Create and export a singleton instance
const adminService = new AdminService();
export default adminService;

