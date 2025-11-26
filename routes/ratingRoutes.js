const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');

router.post('/', ratingController.createRating);
router.get('/:booking_id', ratingController.getRating);

module.exports = router;
