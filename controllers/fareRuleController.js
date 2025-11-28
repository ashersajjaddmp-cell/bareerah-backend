const { query } = require('../config/db');

const fareRuleController = {
  // Get all fare rules
  async getAllFareRules(req, res, next) {
    try {
      const result = await query('SELECT * FROM fare_rules ORDER BY vehicle_type');
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      next(error);
    }
  },

  // Get fare rule by vehicle type
  async getFareRuleByType(req, res, next) {
    try {
      const { type } = req.params;
      const result = await query(
        'SELECT * FROM fare_rules WHERE vehicle_type = $1',
        [type.toLowerCase()]
      );
      
      if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Fare rule not found' });
      }
      
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  // Update fare rule
  async updateFareRule(req, res, next) {
    try {
      const { type } = req.params;
      const { base_fare, per_km_rate } = req.body;

      if (!base_fare && base_fare !== 0 || !per_km_rate && per_km_rate !== 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'base_fare and per_km_rate are required' 
        });
      }

      const result = await query(
        `UPDATE fare_rules 
         SET base_fare = $1, per_km_rate = $2, updated_at = NOW() 
         WHERE vehicle_type = $3 
         RETURNING *`,
        [parseFloat(base_fare), parseFloat(per_km_rate), type.toLowerCase()]
      );

      if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Fare rule not found' });
      }

      res.json({
        success: true,
        message: 'Fare rule updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = fareRuleController;
