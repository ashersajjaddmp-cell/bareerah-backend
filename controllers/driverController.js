const Driver = require('../models/Driver');

const driverController = {
  async getAllDrivers(req, res, next) {
    try {
      const drivers = await Driver.findAll();
      res.json({
        success: true,
        data: drivers
      });
    } catch (error) {
      next(error);
    }
  },

  async getDriverById(req, res, next) {
    try {
      const { id } = req.params;
      const driver = await Driver.getDetailedInfo(id);
      if (!driver) {
        return res.status(404).json({ success: false, error: 'Driver not found' });
      }
      res.json({
        success: true,
        driver
      });
    } catch (error) {
      next(error);
    }
  },

  async updateDriver(req, res, next) {
    try {
      const { id } = req.params;
      const driver = await Driver.updateDriver(id, req.body);
      res.json({
        success: true,
        message: 'Driver updated successfully',
        driver
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = driverController;
