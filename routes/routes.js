const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { verifyToken, verifyAdmin, verifyAdminOrSupervisor } = require('../middleware/auth');

// Admin only routes
router.post('/', verifyToken, verifyAdmin, routeController.createRoute);
router.put('/:id', verifyToken, verifyAdmin, routeController.updateRoute);
router.delete('/:id', verifyToken, verifyAdmin, routeController.deleteRoute);

// Admin and supervisor routes
router.get('/', verifyToken, verifyAdminOrSupervisor, routeController.getRoutes);
router.get('/:id', verifyToken, verifyAdminOrSupervisor, routeController.getRoute);

module.exports = router;