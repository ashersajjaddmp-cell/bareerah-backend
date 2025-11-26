const { query } = require('../config/db');
const logger = require('../utils/logger');

const ratingController = {
  async createRating(req, res, next) {
    try {
      const { booking_id, driver_rating, trip_rating, customer_feedback } = req.body;
      
      const result = await query(`
        INSERT INTO driver_ratings (booking_id, driver_rating, trip_rating, customer_feedback)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (booking_id) DO UPDATE SET 
          driver_rating = $2, trip_rating = $3, customer_feedback = $4, created_at = NOW()
        RETURNING *
      `, [booking_id, driver_rating, trip_rating, customer_feedback]);

      logger.info(`Rating recorded for booking ${booking_id}`);
      res.json({ success: true, message: 'Rating recorded', rating: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async getRating(req, res, next) {
    try {
      const { booking_id } = req.params;
      const result = await query(
        'SELECT * FROM driver_ratings WHERE booking_id = $1',
        [booking_id]
      );
      res.json({ success: true, rating: result.rows[0] || null });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ratingController;
