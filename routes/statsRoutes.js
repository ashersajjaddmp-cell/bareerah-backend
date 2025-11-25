const express = require('express');
const statsController = require('../controllers/statsController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/summary', asyncHandler(statsController.getSummary));
router.get('/bookings', asyncHandler(statsController.getBookings));

module.exports = router;
