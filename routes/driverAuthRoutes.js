const express = require('express');
const router = express.Router();
const driverAuthController = require('../controllers/driverAuthController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', driverAuthController.driverSignup);
router.post('/login', driverAuthController.driverLogin);
router.get('/profile', authMiddleware, driverAuthController.getDriverProfile);

module.exports = router;
