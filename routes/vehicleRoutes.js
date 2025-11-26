const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authenticate } = require('../middleware/auth');

router.get('/', vehicleController.getAvailableVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.post('/', authenticate, vehicleController.createVehicle);

module.exports = router;
