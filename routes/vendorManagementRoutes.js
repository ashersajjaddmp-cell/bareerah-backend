const express = require('express');
const router = express.Router();
const vendorManagementController = require('../controllers/vendorManagementController');
const authMiddleware = require('../middleware/authMiddleware');
const { rbacMiddleware } = require('../middleware/rbacMiddleware');

// Vendor approvals
router.get('/pending-vendors', authMiddleware, rbacMiddleware(['admin']), vendorManagementController.getPendingVendors);
router.post('/approve-vendor/:vendorId', authMiddleware, rbacMiddleware(['admin']), vendorManagementController.approveVendor);
router.post('/reject-vendor/:vendorId', authMiddleware, rbacMiddleware(['admin']), vendorManagementController.rejectVendor);

// Vendor details
router.get('/fleet/:vendorId', vendorManagementController.getVendorFleet);
router.get('/earnings/:vendorId', vendorManagementController.getVendorEarnings);

// Driver approvals
router.get('/pending-drivers', authMiddleware, rbacMiddleware(['admin']), vendorManagementController.approvePendingDrivers);
router.post('/approve-driver/:driverId', authMiddleware, rbacMiddleware(['admin']), vendorManagementController.approveDriver);
router.post('/reject-driver/:driverId', authMiddleware, rbacMiddleware(['admin']), vendorManagementController.rejectDriver);

module.exports = router;
