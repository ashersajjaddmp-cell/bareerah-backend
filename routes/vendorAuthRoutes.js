const express = require('express');
const router = express.Router();
const vendorAuthController = require('../controllers/vendorAuthController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', vendorAuthController.vendorSignup);
router.post('/login', vendorAuthController.vendorLogin);
router.get('/profile', authMiddleware, vendorAuthController.getVendorProfile);
router.put('/profile', authMiddleware, vendorAuthController.updateVendorProfile);
router.get('/stats', authMiddleware, vendorAuthController.getVendorStats);
router.get('/top-drivers', authMiddleware, vendorAuthController.getTopDrivers);
router.get('/top-models', authMiddleware, vendorAuthController.getTopModels);

module.exports = router;
