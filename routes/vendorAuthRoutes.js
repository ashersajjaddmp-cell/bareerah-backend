const express = require('express');
const router = express.Router();
const vendorAuthController = require('../controllers/vendorAuthController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', vendorAuthController.vendorSignup);
router.post('/login', vendorAuthController.vendorLogin);
router.get('/profile', authMiddleware, vendorAuthController.getVendorProfile);
router.put('/profile', authMiddleware, vendorAuthController.updateVendorProfile);

module.exports = router;
