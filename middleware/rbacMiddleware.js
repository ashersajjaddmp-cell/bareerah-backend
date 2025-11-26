const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const rbacMiddleware = (requiredRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    if (requiredRoles.length === 0) {
      return next();
    }

    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `Access denied. Required role(s): ${requiredRoles.join(', ')}` 
      });
    }

    next();
  };
};

// Operator restrictions - middleware to block restricted operations
const operatorRestrictions = (req, res, next) => {
  if (req.user?.role === 'operator') {
    const restrictedMethods = {
      DELETE: true,
      PUT: ['fare', 'settings', 'keys', 'vendors', 'system']
    };

    const path = req.path.toLowerCase();
    const restrictedPaths = [
      '/api/reports',
      '/api/stats/summary',
      '/api/vendors',
      '/api/system',
      '/api/settings',
      '/api/keys',
      '/dashboard/settings',
      '/notification-logs'
    ];

    // Block DELETE requests for operators
    if (req.method === 'DELETE') {
      return res.status(403).json({ 
        success: false, 
        error: 'Operators cannot delete resources' 
      });
    }

    // Block restricted paths
    const isRestricted = restrictedPaths.some(restricted => path.includes(restricted));
    if (isRestricted) {
      return res.status(403).json({ 
        success: false, 
        error: 'Operators cannot access this resource' 
      });
    }
  }

  next();
};

// Vendor restrictions - can only access own data
const vendorRestrictions = (req, res, next) => {
  if (req.user?.role === 'vendor') {
    req.vendor_id = req.user.vendor_id;
  }
  next();
};

module.exports = { rbacMiddleware, operatorRestrictions, vendorRestrictions };
