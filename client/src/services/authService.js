// Authentication service for connecting to PostgreSQL backend
const API_BASE = "http://localhost:5000/api";

class AuthService {
  /* ================= TOKEN UTILS ================= */

  setToken(token) {
    localStorage.setItem("auth_token", token);
  }

  getToken() {
    return localStorage.getItem("auth_token");
  }

  removeToken() {
    localStorage.removeItem("auth_token");
  }

  /* ================= AUTH CHECKS ================= */

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  }

  /* ================= REGISTER ================= */

  async register(userData) {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      // ✅ SUCCESS
      if (response.ok && data.success && data.token) {
        this.setToken(data.token);
        return { success: true, user: data.user };
      }

      // ❌ USER ALREADY EXISTS
      if (response.status === 409) {
        return { success: false, error: "User already exists. Please login." };
      }

      return { success: false, error: data.message || "Registration failed" };
    } catch (error) {
      return { success: false, error: "Network error. Please try again." };
    }
  }

  /* ================= LOGIN ================= */

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        this.setToken(data.token);
        return { success: true, user: data.user };
      }

      return { success: false, error: data.message || "Login failed" };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  }

  /* ================= LOGOUT ================= */

  logout() {
    this.removeToken();
    window.location.href = "/";
  }

  /* ================= PROFILE ================= */

  async getProfile() {
    const token = this.getToken();
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, data: data.user };
      }

      return { success: false, error: data.message };
    } catch {
      return { success: false, error: "Network error" };
    }
  }

  /* ================= AUTH FETCH ================= */

  async authenticatedRequest(url, options = {}) {
    const token = this.getToken();
    if (!token) throw new Error("No authentication token");

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      this.logout();
      throw new Error("Session expired. Please login again.");
    }

    return response;
  }
}

// Singleton
const authService = new AuthService();
export default authService;
