const express = require('express');
const router = express.Router();
const supervisorController = require('../controllers/supervisorController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Admin only routes
router.post('/', verifyToken, verifyAdmin, supervisorController.createSupervisor);
router.get('/', verifyToken, verifyAdmin, supervisorController.getSupervisors);
router.get('/:id', verifyToken, verifyAdmin, supervisorController.getSupervisor);

module.exports = router;