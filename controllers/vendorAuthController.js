const { query } = require('../config/db');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const vendorAuthController = {
  async vendorSignup(req, res, next) {
    try {
      const { name, email, phone, password, bank_account_number, bank_name, account_holder_name, business_license } = req.body;
      
      if (!name || !email || !phone || !password) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      const passwordHash = await bcryptjs.hash(password, 10);
      
      const result = await query(`
        INSERT INTO vendors (name, email, phone, password_hash, bank_account_number, bank_name, account_holder_name, status, approval_reason)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 'Awaiting admin approval')
        RETURNING id, name, email, status
      `, [name, email, phone, passwordHash, bank_account_number, bank_name, account_holder_name]);

      logger.info(`Vendor signup request: ${result.rows[0].name}`);
      
      res.status(201).json({
        success: true,
        message: 'Vendor registration submitted. Awaiting admin approval.',
        vendor: result.rows[0]
      });
    } catch (error) {
      if (error.message.includes('duplicate key')) {
        return res.status(400).json({ success: false, error: 'Email already registered' });
      }
      next(error);
    }
  },

  async vendorLogin(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password required' });
      }

      const result = await query('SELECT * FROM vendors WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const vendor = result.rows[0];
      if (vendor.status !== 'approved') {
        return res.status(403).json({ success: false, error: `Vendor status: ${vendor.status}. ${vendor.approval_reason || ''}` });
      }

      const passwordMatch = await bcryptjs.compare(password, vendor.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: vendor.id, email: vendor.email, role: 'vendor' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        vendor: { id: vendor.id, name: vendor.name, email: vendor.email }
      });
    } catch (error) {
      next(error);
    }
  },

  async getVendorProfile(req, res, next) {
    try {
      const vendorId = req.user.id;
      const result = await query(`
        SELECT v.*, 
               COUNT(DISTINCT b.id)::int as total_bookings,
               COALESCE(SUM(b.fare_aed * 0.8), 0)::float as total_earnings,
               COALESCE(SUM(CASE WHEN p.status = 'pending' THEN p.amount_aed ELSE 0 END), 0)::float as pending_payout
        FROM vendors v
        LEFT JOIN vehicles vc ON v.id = vc.vendor_id
        LEFT JOIN bookings b ON vc.id = b.assigned_vehicle_id
        LEFT JOIN payouts p ON v.id = p.vendor_id
        WHERE v.id = $1
        GROUP BY v.id
      `, [vendorId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Vendor not found' });
      }

      res.json({ success: true, vendor: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async updateVendorProfile(req, res, next) {
    try {
      const vendorId = req.user.id;
      const { bank_account_number, bank_name, account_holder_name, logo_url } = req.body;
      
      const result = await query(`
        UPDATE vendors 
        SET bank_account_number = COALESCE($1, bank_account_number),
            bank_name = COALESCE($2, bank_name),
            account_holder_name = COALESCE($3, account_holder_name),
            logo_url = COALESCE($4, logo_url),
            updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `, [bank_account_number, bank_name, account_holder_name, logo_url, vendorId]);

      res.json({ success: true, message: 'Profile updated', vendor: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async getVendorStats(req, res, next) {
    try {
      const vendorId = req.user.id;
      const { period } = req.query; // today, yesterday, week, month
      
      let dateFilter = '';
      if (period === 'today') {
        dateFilter = `DATE(b.created_at) = CURRENT_DATE`;
      } else if (period === 'yesterday') {
        dateFilter = `DATE(b.created_at) = CURRENT_DATE - INTERVAL '1 day'`;
      } else if (period === 'week') {
        dateFilter = `b.created_at >= CURRENT_DATE - INTERVAL '7 days'`;
      } else if (period === 'month') {
        dateFilter = `DATE_TRUNC('month', b.created_at) = DATE_TRUNC('month', CURRENT_DATE)`;
      } else {
        dateFilter = `1=1`; // all time
      }

      const result = await query(`
        SELECT 
          COUNT(DISTINCT b.id)::int as total_bookings,
          COALESCE(SUM(b.fare_aed * 0.8), 0)::float as earnings,
          COALESCE(SUM(b.distance_km), 0)::float as total_distance,
          COALESCE(AVG(b.fare_aed * 0.8), 0)::float as avg_earning_per_booking
        FROM vendors v
        LEFT JOIN vehicles vc ON v.id = vc.vendor_id
        LEFT JOIN bookings b ON vc.id = b.assigned_vehicle_id AND ${dateFilter}
        WHERE v.id = $1
        GROUP BY v.id
      `, [vendorId]);

      res.json({ success: true, stats: result.rows[0] || { total_bookings: 0, earnings: 0, total_distance: 0 } });
    } catch (error) {
      next(error);
    }
  },

  async getTopDrivers(req, res, next) {
    try {
      const vendorId = req.user.id;
      const { period } = req.query;
      
      let dateFilter = '';
      if (period === 'today') {
        dateFilter = `AND DATE(b.created_at) = CURRENT_DATE`;
      } else if (period === 'yesterday') {
        dateFilter = `AND DATE(b.created_at) = CURRENT_DATE - INTERVAL '1 day'`;
      } else if (period === 'week') {
        dateFilter = `AND b.created_at >= CURRENT_DATE - INTERVAL '7 days'`;
      } else if (period === 'month') {
        dateFilter = `AND DATE_TRUNC('month', b.created_at) = DATE_TRUNC('month', CURRENT_DATE)`;
      }

      const result = await query(`
        SELECT 
          d.id, d.name,
          COUNT(b.id)::int as bookings,
          COALESCE(SUM(b.fare_aed * 0.8), 0)::float as earnings,
          COALESCE(SUM(b.distance_km), 0)::float as distance
        FROM drivers d
        JOIN vehicles v ON d.id = v.driver_id
        JOIN bookings b ON v.id = b.assigned_vehicle_id
        WHERE v.vendor_id = $1 ${dateFilter}
        GROUP BY d.id, d.name
        ORDER BY bookings DESC
        LIMIT 5
      `, [vendorId]);

      res.json({ success: true, drivers: result.rows });
    } catch (error) {
      next(error);
    }
  },

  async getTopModels(req, res, next) {
    try {
      const vendorId = req.user.id;
      const { period } = req.query;
      
      let dateFilter = '';
      if (period === 'today') {
        dateFilter = `AND DATE(b.created_at) = CURRENT_DATE`;
      } else if (period === 'yesterday') {
        dateFilter = `AND DATE(b.created_at) = CURRENT_DATE - INTERVAL '1 day'`;
      } else if (period === 'week') {
        dateFilter = `AND b.created_at >= CURRENT_DATE - INTERVAL '7 days'`;
      } else if (period === 'month') {
        dateFilter = `AND DATE_TRUNC('month', b.created_at) = DATE_TRUNC('month', CURRENT_DATE)`;
      }

      const result = await query(`
        SELECT 
          v.model, v.color, v.plate_number,
          COUNT(b.id)::int as bookings,
          COALESCE(SUM(b.fare_aed * 0.8), 0)::float as earnings,
          COALESCE(SUM(b.distance_km), 0)::float as distance
        FROM vehicles v
        LEFT JOIN bookings b ON v.id = b.assigned_vehicle_id ${dateFilter}
        WHERE v.vendor_id = $1
        GROUP BY v.id, v.model, v.color, v.plate_number
        ORDER BY bookings DESC
        LIMIT 5
      `, [vendorId]);

      res.json({ success: true, models: result.rows });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = vendorAuthController;
