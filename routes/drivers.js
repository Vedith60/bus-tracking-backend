const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { verifyToken, verifyAdmin, verifyAdminOrSupervisor } = require('../middleware/auth');

// Admin only routes
router.post('/', verifyToken, verifyAdmin, driverController.createDriver);
router.put('/:id', verifyToken, verifyAdmin, driverController.updateDriver);
router.delete('/:id', verifyToken, verifyAdmin, driverController.deleteDriver);

// Admin and supervisor routes
router.get('/', verifyToken, verifyAdminOrSupervisor, driverController.getDrivers);
router.get('/:id', verifyToken, verifyAdminOrSupervisor, driverController.getDriver);

module.exports = router;