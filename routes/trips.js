const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { verifyToken, verifyAdmin, verifySupervisor, verifyAdminOrSupervisor } = require('../middleware/auth');

// Admin and Supervisor routes
router.post('/', verifyToken, verifyAdminOrSupervisor, tripController.createTrip);
router.get('/', verifyToken, verifyAdminOrSupervisor, tripController.getTrips);
router.get('/supervisor', verifyToken, verifyAdminOrSupervisor, tripController.getSupervisorTrips);
router.get('/:id', verifyToken, verifyAdminOrSupervisor, tripController.getTrip);
router.put('/:id', verifyToken, verifyAdminOrSupervisor, tripController.updateTrip);
router.delete('/:id', verifyToken, verifyAdminOrSupervisor, tripController.deleteTrip);

module.exports = router;