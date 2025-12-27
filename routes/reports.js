const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, verifyAdmin, verifySupervisor, verifyAdminOrSupervisor } = require('../middleware/auth');

// Admin only reports
router.get('/admin/dashboard', verifyToken, verifyAdmin, reportController.getAdminDashboardStats);
router.get('/admin/trips', verifyToken, verifyAdmin, reportController.getTripReports);
router.get('/admin/certificates', verifyToken, verifyAdmin, reportController.getCertificateReports);

// Supervisor only reports
router.get('/supervisor/dashboard', verifyToken, verifySupervisor, reportController.getSupervisorDashboardStats);
router.get('/supervisor/trips', verifyToken, verifySupervisor, reportController.getSupervisorTripReports);

module.exports = router;