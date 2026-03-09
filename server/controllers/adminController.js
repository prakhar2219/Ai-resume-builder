const { pool } = require('../config/database');

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get total users count
    const usersCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM users'
    );
    const totalUsers = parseInt(usersCountResult.rows[0].count);

    // Get total resumes count
    const resumesCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM resumes WHERE is_active = true'
    );
    const totalResumes = parseInt(resumesCountResult.rows[0].count);

    // Get recent users (last 30 days)
    const recentUsersResult = await pool.query(
      `SELECT COUNT(*) as count FROM users 
       WHERE created_at >= NOW() - INTERVAL '30 days'`
    );
    const recentUsers = parseInt(recentUsersResult.rows[0].count);

    // Get recent resumes (last 30 days)
    const recentResumesResult = await pool.query(
      `SELECT COUNT(*) as count FROM resumes 
       WHERE is_active = true AND created_at >= NOW() - INTERVAL '30 days'`
    );
    const recentResumes = parseInt(recentResumesResult.rows[0].count);

    // Get enhancement history count
    const enhancementsCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM enhancement_history'
    );
    const totalEnhancements = parseInt(enhancementsCountResult.rows[0].count);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalResumes,
        recentUsers,
        recentResumes,
        totalEnhancements
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
};

// Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get users with resume count
    const usersResult = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.created_at,
        u.updated_at,
        COUNT(r.id) as resume_count
      FROM users u
      LEFT JOIN resumes r ON u.id = r.user_id AND r.is_active = true
      GROUP BY u.id, u.email, u.name, u.role, u.created_at, u.updated_at
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Get total count
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const total = parseInt(totalResult.rows[0].count);

    res.json({
      success: true,
      data: {
        users: usersResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

// Get all resumes with pagination
const getAllResumes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const resumesResult = await pool.query(`
      SELECT 
        r.id,
        r.title,
        r.template_id,
        r.created_at,
        r.updated_at,
        u.id as user_id,
        u.email as user_email,
        u.name as user_name
      FROM resumes r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.is_active = true
      ORDER BY r.updated_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const totalResult = await pool.query(
      'SELECT COUNT(*) as count FROM resumes WHERE is_active = true'
    );
    const total = parseInt(totalResult.rows[0].count);

    res.json({
      success: true,
      data: {
        resumes: resumesResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all resumes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resumes'
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be "user" or "admin"'
      });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, name, role',
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role'
    });
  }
};

// Delete user (soft delete - deactivate)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete user's resumes first (cascade will handle this, but we can also soft delete)
    await pool.query(
      'UPDATE resumes SET is_active = false WHERE user_id = $1',
      [userId]
    );

    // For now, we'll just deactivate the user by removing them
    // In a production app, you might want to add an is_active column to users table
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, email, name',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};

// Get enhancement history
const getEnhancementHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const historyResult = await pool.query(`
      SELECT 
        eh.id,
        eh.section_type,
        eh.enhancement_timestamp,
        eh.processing_time_ms,
        eh.user_rating,
        eh.ai_model,
        r.id as resume_id,
        r.title as resume_title,
        u.id as user_id,
        u.email as user_email,
        u.name as user_name
      FROM enhancement_history eh
      LEFT JOIN resumes r ON eh.resume_id = r.id
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY eh.enhancement_timestamp DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const totalResult = await pool.query(
      'SELECT COUNT(*) as count FROM enhancement_history'
    );
    const total = parseInt(totalResult.rows[0].count);

    res.json({
      success: true,
      data: {
        enhancements: historyResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get enhancement history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enhancement history'
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllResumes,
  updateUserRole,
  deleteUser,
  getEnhancementHistory
};

