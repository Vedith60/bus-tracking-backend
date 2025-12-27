const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { verifyToken } = require('../middleware/auth');

// Public route for super admin login
router.post('/login-super-admin', superAdminController.loginSuperAdmin);

// Protected routes for super admin functionality
router.post('/admins', verifyToken, superAdminController.createAdmin);
router.delete('/admins/:adminId', verifyToken, superAdminController.deleteAdmin);
router.get('/admins', verifyToken, superAdminController.getAllAdmins);
router.put('/admins/:adminId/reset-password', verifyToken, superAdminController.resetAdminPassword);

module.exports = router;