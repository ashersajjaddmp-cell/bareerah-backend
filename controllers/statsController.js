const Stats = require('../models/Stats');

const statsController = {
  async getSummary(req, res, next) {
    try {
      const { range, start, end } = req.query;
      let startDate, endDate;

      if (start && end) {
        startDate = start;
        endDate = end;
      } else if (range) {
        const dates = await Stats.getDateRange(range);
        if (!dates) {
          return res.status(400).json({ error: 'Invalid range' });
        }
        startDate = dates.startDate;
        endDate = dates.endDate;
      } else {
        return res.status(400).json({ error: 'Provide range or start/end dates' });
      }

      const summary = await Stats.getSummary(startDate, endDate);
      const trend = await Stats.getBookingsTrend(startDate, endDate);
      const revenueByType = await Stats.getRevenueByType(startDate, endDate);
      const driverStats = await Stats.getDriverStats(startDate, endDate);

      res.json({
        success: true,
        data: {
          summary,
          trend,
          revenueByType,
          driverStats,
          period: { startDate, endDate }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getBookings(req, res, next) {
    try {
      const { range, start, end, status, vehicle_type } = req.query;
      let startDate, endDate;

      if (start && end) {
        startDate = start;
        endDate = end;
      } else if (range) {
        const dates = await Stats.getDateRange(range);
        if (!dates) {
          return res.status(400).json({ error: 'Invalid range' });
        }
        startDate = dates.startDate;
        endDate = dates.endDate;
      } else {
        return res.status(400).json({ error: 'Provide range or start/end dates' });
      }

      const filters = { status, vehicle_type };
      const bookings = await Stats.getAllBookings(startDate, endDate, filters);

      res.json({
        success: true,
        data: {
          bookings,
          period: { startDate, endDate }
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = statsController;
