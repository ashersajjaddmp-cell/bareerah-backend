const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');
const { rbacMiddleware, operatorRestrictions } = require('../middleware/rbacMiddleware');

router.post('/calculate-fare', bookingController.calculateFare);
router.get('/available-vehicles', vehicleController.getAvailableVehicles);
router.post('/create-booking', authMiddleware, rbacMiddleware(['admin', 'operator']), operatorRestrictions, bookingController.createBooking);
router.post('/assign-vehicle', authMiddleware, rbacMiddleware(['admin', 'operator']), operatorRestrictions, bookingController.assignVehicle);

module.exports = router;
