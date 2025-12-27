const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/register-admin', authController.registerAdmin);
router.post('/login-admin', authController.loginAdmin);
router.post('/login-supervisor', authController.loginSupervisor);

// Protected routes
router.get('/profile', verifyToken, authController.getProfile);
router.put('/change-password', verifyToken, authController.changePassword);

module.exports = router;