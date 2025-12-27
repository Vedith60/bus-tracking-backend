const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const { verifyToken, verifyAdmin, verifyAdminOrSupervisor } = require('../middleware/auth');

// Admin only routes
router.post('/', verifyToken, verifyAdmin, busController.createBus);
router.put('/:id', verifyToken, verifyAdmin, busController.updateBus);
router.delete('/:id', verifyToken, verifyAdmin, busController.deleteBus);

// Admin and supervisor routes
router.get('/', verifyToken, verifyAdminOrSupervisor, busController.getBuses);
router.get('/:id', verifyToken, verifyAdminOrSupervisor, busController.getBus);

// Certificate routes
router.post('/:id/certificates', verifyToken, verifyAdmin, busController.createCertificate);
router.get('/certificates', verifyToken, verifyAdmin, busController.getCertificates);
router.put('/certificates/:id', verifyToken, verifyAdmin, busController.updateCertificate);
router.delete('/certificates/:id', verifyToken, verifyAdmin, busController.deleteCertificate);

module.exports = router;