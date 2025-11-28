const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const vendorController = require('../controllers/vendorController');
const authMiddleware = require('../middleware/authMiddleware');
const { rbacMiddleware } = require('../middleware/rbacMiddleware');

// Vendor login endpoint
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }

    // Demo vendor credentials
    if (username === 'vendor1' && password === 'vendor123') {
      const token = jwt.sign(
        { vendor_id: 'vendor1', username: 'vendor1', role: 'vendor' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({ 
        success: true, 
        token,
        user: { vendor_id: 'vendor1', username: 'vendor1', role: 'vendor' }
      });
    }

    res.status(401).json({ success: false, error: 'Invalid vendor credentials' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin routes (protected)
router.get('/', authMiddleware, rbacMiddleware(['admin']), vendorController.getAllVendors);
router.get('/status/:status', authMiddleware, rbacMiddleware(['admin']), vendorController.getVendorsByStatus);
router.get('/:id', authMiddleware, vendorController.getVendorById);
router.post('/', authMiddleware, rbacMiddleware(['admin']), vendorController.createVendor);
router.post('/:id/approve', authMiddleware, rbacMiddleware(['admin']), vendorController.approveVendor);
router.post('/:id/reject', authMiddleware, rbacMiddleware(['admin']), vendorController.rejectVendor);
router.post('/:id/toggle-auto-assign', authMiddleware, rbacMiddleware(['admin']), vendorController.toggleAutoAssign);
router.get('/:vendor_id/bookings', authMiddleware, vendorController.getVendorBookings);
router.get('/:id/drivers', authMiddleware, vendorController.getVendorDrivers);

module.exports = router;
