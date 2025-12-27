const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { verifyToken, verifyAdmin, verifySupervisor } = require('../middleware/auth');

// Supervisor routes
router.get('/supervisor', verifyToken, verifySupervisor, maintenanceController.getMaintenanceForSupervisor);
router.post('/supervisor', verifyToken, verifySupervisor, maintenanceController.createMaintenanceForSupervisor);

// Admin routes
router.post('/', verifyToken, verifyAdmin, maintenanceController.createMaintenance);
router.get('/', verifyToken, verifyAdmin, maintenanceController.getMaintenance);
router.get('/:id', verifyToken, verifyAdmin, maintenanceController.getMaintenanceById);
router.put('/:id', verifyToken, verifyAdmin, maintenanceController.updateMaintenance);
router.delete('/:id', verifyToken, verifyAdmin, maintenanceController.deleteMaintenance);



module.exports = router;