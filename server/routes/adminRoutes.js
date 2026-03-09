const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const adminController = require('../controllers/adminController');

router.use(authenticateToken, requireAdmin);

router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.get('/resumes', adminController.getAllResumes);
router.put('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);
router.get('/enhancements', adminController.getEnhancementHistory);

module.exports = router;
