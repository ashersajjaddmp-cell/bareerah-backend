const { query } = require('../config/db');

const Vendor = {
  async findById(id) {
    const result = await query('SELECT * FROM vendors WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findAll() {
    const result = await query('SELECT * FROM vendors ORDER BY created_at DESC');
    return result.rows;
  },

  async findByStatus(status) {
    const result = await query('SELECT * FROM vendors WHERE status = $1 ORDER BY created_at DESC', [status]);
    return result.rows;
  },

  async create(data) {
    const result = await query(`
      INSERT INTO vendors (name, phone, email, commission_rate, status, logo_url, bank_account_number, bank_name, account_holder_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [data.name, data.phone, data.email, data.commission_rate || 0.8, data.status || 'pending', data.logo_url, data.bank_account_number, data.bank_name, data.account_holder_name]);
    return result.rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (data.name) { fields.push(`name = $${paramIndex++}`); values.push(data.name); }
    if (data.phone) { fields.push(`phone = $${paramIndex++}`); values.push(data.phone); }
    if (data.email) { fields.push(`email = $${paramIndex++}`); values.push(data.email); }
    if (data.commission_rate !== undefined) { fields.push(`commission_rate = $${paramIndex++}`); values.push(data.commission_rate); }
    if (data.status) { fields.push(`status = $${paramIndex++}`); values.push(data.status); }
    if (data.logo_url) { fields.push(`logo_url = $${paramIndex++}`); values.push(data.logo_url); }
    if (data.bank_account_number) { fields.push(`bank_account_number = $${paramIndex++}`); values.push(data.bank_account_number); }
    if (data.bank_name) { fields.push(`bank_name = $${paramIndex++}`); values.push(data.bank_name); }
    if (data.account_holder_name) { fields.push(`account_holder_name = $${paramIndex++}`); values.push(data.account_holder_name); }
    if (data.rejection_reason) { fields.push(`rejection_reason = $${paramIndex++}`); values.push(data.rejection_reason); }
    if (data.auto_assign_disabled !== undefined) { fields.push(`auto_assign_disabled = $${paramIndex++}`); values.push(data.auto_assign_disabled); }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(`UPDATE vendors SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
    return result.rows[0];
  },

  async approveVendor(id) {
    const result = await query(`UPDATE vendors SET status = 'approved' WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
  },

  async rejectVendor(id, reason) {
    const result = await query(`UPDATE vendors SET status = 'rejected', rejection_reason = $2 WHERE id = $1 RETURNING *`, [id, reason]);
    return result.rows[0];
  },

  async toggleAutoAssign(id, disabled) {
    const result = await query(`UPDATE vendors SET auto_assign_disabled = $2 WHERE id = $1 RETURNING *`, [id, disabled]);
    return result.rows[0];
  },

  async getVendorWithStats(id) {
    const vendor = await this.findById(id);
    if (!vendor) return null;

    const stats = await query(`
      SELECT 
        COUNT(DISTINCT v.id) as total_vehicles,
        COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings,
        COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.fare_aed ELSE 0 END), 0) as total_earnings,
        COALESCE(SUM(CASE WHEN vp.paid = false THEN vp.amount ELSE 0 END), 0) as pending_payout
      FROM vendors vn
      LEFT JOIN vehicles v ON vn.id = v.vendor_id
      LEFT JOIN bookings b ON vn.id = b.vendor_id
      LEFT JOIN vendor_payouts vp ON vn.id = vp.vendor_id
      WHERE vn.id = $1
      GROUP BY vn.id
    `, [id]);

    return { ...vendor, ...stats.rows[0] };
  }
};

module.exports = Vendor;
