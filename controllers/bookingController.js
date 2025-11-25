const bookingService = require('../services/bookingService');

const bookingController = {
  async calculateFare(req, res, next) {
    try {
      const fare = bookingService.calculateFare(req.body);
      res.json({
        success: true,
        ...fare
      });
    } catch (error) {
      next(error);
    }
  },

  async createBooking(req, res, next) {
    try {
      const result = await bookingService.createBooking(req.body);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  },

  async assignVehicle(req, res, next) {
    try {
      const { booking_id, vehicle_id } = req.body;
      const booking = await bookingService.assignVehicle(booking_id, vehicle_id);
      res.json({
        success: true,
        booking
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = bookingController;
