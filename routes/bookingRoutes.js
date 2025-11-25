const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const vehicleController = require('../controllers/vehicleController');

router.post('/calculate-fare', bookingController.calculateFare);
router.get('/available-vehicles', vehicleController.getAvailableVehicles);
router.post('/create-booking', bookingController.createBooking);
router.post('/assign-vehicle', bookingController.assignVehicle);

module.exports = router;
