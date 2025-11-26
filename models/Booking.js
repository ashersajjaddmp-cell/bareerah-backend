const { query } = require('../config/db');

const Booking = {
  async findById(id) {
    const result = await query('SELECT * FROM bookings WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create(data) {
    const {
      customer_name,
      customer_phone,
      customer_email,
      pickup_location,
      dropoff_location,
      distance_km,
      fare_aed,
      vehicle_type,
      booking_type,
      passengers_count,
      luggage_count,
      caller_number,
      confirmed_contact_number
    } = data;

    const result = await query(`
      INSERT INTO bookings (
        customer_name, 
        customer_phone,
        customer_email,
        pickup_location,
        dropoff_location,
        distance_km,
        fare_aed,
        vehicle_type,
        booking_type,
        status,
        passengers_count,
        luggage_count,
        caller_number,
        confirmed_contact_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, $11, $12, $13)
      RETURNING *
    `, [
      customer_name,
      customer_phone,
      customer_email || null,
      pickup_location || null,
      dropoff_location || null,
      distance_km || 0,
      fare_aed,
      vehicle_type,
      booking_type || 'point_to_point',
      passengers_count || 1,
      luggage_count || 0,
      caller_number || null,
      confirmed_contact_number || null
    ]);
    
    return result.rows[0];
  },

  async updateAssignment(bookingId, vehicleId, vendorId) {
    const result = await query(`
      UPDATE bookings 
      SET assigned_vehicle_id = $1, vendor_id = $2, status = 'assigned', updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [vehicleId, vendorId, bookingId]);
    return result.rows[0];
  },

  async updateStatus(id, status) {
    const result = await query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }
};

module.exports = Booking;
