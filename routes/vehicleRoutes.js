const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

router.get('/', vehicleController.getAvailableVehicles);
router.get('/:id', vehicleController.getVehicleById);

module.exports = router;
