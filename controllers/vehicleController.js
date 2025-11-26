const vehicleService = require('../services/vehicleService');

const vehicleController = {
  async getAvailableVehicles(req, res, next) {
    try {
      const { type } = req.query;
      const vehicles = await vehicleService.getAvailableVehicles(type);
      res.json({
        success: true,
        vehicles
      });
    } catch (error) {
      next(error);
    }
  },

  async getVehicleById(req, res, next) {
    try {
      const vehicle = await vehicleService.getVehicleById(req.params.id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        });
      }
      res.json({
        success: true,
        vehicle
      });
    } catch (error) {
      next(error);
    }
  },

  async createVehicle(req, res, next) {
    try {
      const vehicle = await vehicleService.createVehicle(req.body);
      res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        vehicle
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllVehicles(req, res, next) {
    try {
      const { type } = req.query;
      const Vehicle = require('../models/Vehicle');
      const vehicles = await Vehicle.getAll(type);
      res.json({
        success: true,
        vehicles
      });
    } catch (error) {
      next(error);
    }
  },

  async updateVehicle(req, res, next) {
    try {
      const { id } = req.params;
      const Vehicle = require('../models/Vehicle');
      const vehicle = await Vehicle.updateVehicle(id, req.body);
      res.json({
        success: true,
        message: 'Vehicle updated successfully',
        vehicle
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = vehicleController;
