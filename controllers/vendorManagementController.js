const { query } = require('../config/db');
const logger = require('../utils/logger');

const vendorManagementController = {
  async getPendingVendors(req, res, next) {
    try {
      const result = await query(`
        SELECT id, name, email, phone, status, approval_reason, created_at
        FROM vendors
        WHERE status IN ('pending', 'rejected')
        ORDER BY created_at DESC
      `);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  async approveVendor(req, res, next) {
    try {
      const { vendorId } = req.params;
      const result = await query(`
        UPDATE vendors
        SET status = 'approved', approval_reason = 'Approved by admin'
        WHERE id = $1
        RETURNING *
      `, [vendorId]);

      logger.info(`Vendor approved: ${result.rows[0].name}`);
      res.json({ success: true, message: 'Vendor approved', vendor: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async rejectVendor(req, res, next) {
    try {
      const { vendorId } = req.params;
      const { reason } = req.body;
      
      const result = await query(`
        UPDATE vendors
        SET status = 'rejected', approval_reason = $1
        WHERE id = $2
        RETURNING *
      `, [reason || 'Rejected by admin', vendorId]);

      res.json({ success: true, message: 'Vendor rejected', vendor: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async getVendorFleet(req, res, next) {
    try {
      const vendorId = req.params.vendorId;
      const result = await query(`
        SELECT v.*, 
               COUNT(DISTINCT vc.id)::int as vehicle_count,
               STRING_AGG(DISTINCT vc.type, ', ')::text as vehicle_types
        FROM vendors v
        LEFT JOIN vehicles vc ON v.id = vc.vendor_id
        WHERE v.id = $1
        GROUP BY v.id
      `, [vendorId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Vendor not found' });
      }

      const vehiclesResult = await query(`
        SELECT id, model, type, plate_number, color, status
        FROM vehicles
        WHERE vendor_id = $1
        ORDER BY type
      `, [vendorId]);

      res.json({ 
        success: true, 
        vendor: result.rows[0],
        vehicles: vehiclesResult.rows 
      });
    } catch (error) {
      next(error);
    }
  },

  async getVendorEarnings(req, res, next) {
    try {
      const vendorId = req.params.vendorId;
      const result = await query(`
        SELECT 
          COUNT(DISTINCT b.id)::int as total_bookings,
          COALESCE(SUM(b.fare_aed * 0.8), 0)::float as total_earnings,
          COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount_aed ELSE 0 END), 0)::float as paid_amount,
          COALESCE(SUM(CASE WHEN p.status = 'pending' THEN p.amount_aed ELSE 0 END), 0)::float as pending_payout
        FROM vendors v
        LEFT JOIN vehicles vc ON v.id = vc.vendor_id
        LEFT JOIN bookings b ON vc.id = b.vehicle_id
        LEFT JOIN payouts p ON v.id = p.vendor_id
        WHERE v.id = $1
      `, [vendorId]);

      res.json({ success: true, earnings: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async approvePendingDrivers(req, res, next) {
    try {
      const result = await query(`
        SELECT id, name, email, license_number, driver_registration_status, created_at
        FROM drivers
        WHERE driver_registration_status IN ('pending', 'rejected')
        ORDER BY created_at DESC
      `);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  async approveDriver(req, res, next) {
    try {
      const { driverId } = req.params;
      const result = await query(`
        UPDATE drivers
        SET driver_registration_status = 'approved'
        WHERE id = $1
        RETURNING *
      `, [driverId]);

      res.json({ success: true, message: 'Driver approved', driver: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async rejectDriver(req, res, next) {
    try {
      const { driverId } = req.params;
      const { reason } = req.body;
      
      const result = await query(`
        UPDATE drivers
        SET driver_registration_status = 'rejected'
        WHERE id = $1
        RETURNING *
      `, [driverId]);

      res.json({ success: true, message: 'Driver rejected', driver: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = vendorManagementController;
