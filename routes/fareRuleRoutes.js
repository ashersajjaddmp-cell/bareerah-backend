const express = require('express');
const router = express.Router();
const fareRuleController = require('../controllers/fareRuleController');
const authMiddleware = require('../middleware/authMiddleware');
const { rbacMiddleware } = require('../middleware/rbacMiddleware');

// Public - anyone can view fare rules
router.get('/', fareRuleController.getAllFareRules);
router.get('/:type', fareRuleController.getFareRuleByType);

// Admin only - update fare rules
router.put('/:type', authMiddleware, rbacMiddleware(['admin']), fareRuleController.updateFareRule);

module.exports = router;
