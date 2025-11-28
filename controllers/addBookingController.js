const { query } = require('../config/db');
const fareCalculator = require('../utils/fareCalculator');
const logger = require('../utils/logger');

const addBookingController = {
  async createManualBooking(req, res, next) {
    try {
      const {
        customer_name,
        customer_phone,
        customer_email,
        pickup_location,
        dropoff_location,
        distance_km,
        booking_type,
        vehicle_type,
        vehicle_model,
        car_model,
        driver_id,
        assigned_vehicle_id,
        payment_method,
        status,
        booking_source
      } = req.body;

      // Validate required fields
      if (!customer_name || !customer_phone || !pickup_location || !dropoff_location || !distance_km || !booking_type || !vehicle_type) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      // Calculate fare (async - reads from database)
      const fareResult = await fareCalculator.calculateFare(
        booking_type.toLowerCase(),
        vehicle_type.toLowerCase(),
        parseFloat(distance_km),
        0
      );
      const fare = fareResult.fare;

      // Determine vehicle model - use vehicle_model if provided, otherwise car_model
      const finalVehicleModel = vehicle_model || car_model || 'Not specified';
      
      // AUTO-ASSIGNMENT: If assigned_vehicle_id is provided, use that vehicle's tagged driver
      let finalDriverId = driver_id;
      let finalAssignedVehicleId = assigned_vehicle_id;
      
      if (assigned_vehicle_id) {
        // Get the vehicle's tagged driver
        const vehicleResult = await query('SELECT driver_id FROM vehicles WHERE id = $1', [assigned_vehicle_id]);
        if (vehicleResult.rows.length > 0 && vehicleResult.rows[0].driver_id && !driver_id) {
          finalDriverId = vehicleResult.rows[0].driver_id; // Auto-assign tagged driver if no driver specified
        }
      }
      
      // Create booking (database auto-generates UUID)
      const result = await query(`
        INSERT INTO bookings 
          (customer_name, customer_phone, customer_email, pickup_location, dropoff_location, 
           distance_km, fare_aed, booking_type, vehicle_type, vehicle_model, driver_id, assigned_vehicle_id, payment_method, status, booking_source, created_at)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
        RETURNING *
      `, [
        customer_name, customer_phone, customer_email || null, pickup_location,
        dropoff_location, distance_km, fare, booking_type, vehicle_type, finalVehicleModel, finalDriverId || null, finalAssignedVehicleId || null, payment_method || 'cash',
        status || 'in-process', booking_source || 'manually_created'
      ])

      logger.info(`Manual booking created: ${result.rows[0].id}`);
      
      // Send confirmation email if email provided
      if (customer_email) {
        const emailService = require('../utils/emailService');
        emailService.sendCustomerNotification(result.rows[0], null);
      }

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        booking: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = addBookingController;
