const vendorService = require('../services/vendorService');

const vendorController = {
  async getAllVendors(req, res, next) {
    try {
      const vendors = await vendorService.getAllVendors();
      res.json({
        success: true,
        vendors
      });
    } catch (error) {
      next(error);
    }
  },

  async getVendorById(req, res, next) {
    try {
      const vendor = await vendorService.getVendorById(req.params.id);
      if (!vendor) {
        return res.status(404).json({
          success: false,
          error: 'Vendor not found'
        });
      }
      res.json({
        success: true,
        vendor
      });
    } catch (error) {
      next(error);
    }
  },

  async createVendor(req, res, next) {
    try {
      const vendor = await vendorService.createVendor(req.body);
      res.status(201).json({
        success: true,
        vendor
      });
    } catch (error) {
      next(error);
    }
  },

  async getVendorDrivers(req, res, next) {
    try {
      const drivers = await vendorService.getVendorDrivers(req.params.id);
      res.json({
        success: true,
        drivers
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = vendorController;
