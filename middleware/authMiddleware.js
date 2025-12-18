const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token format'
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. Please login again.',
        code: 'TOKEN_INVALID'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Authentication failed. Please login again.',
      code: 'AUTH_FAILED'
    });
  }
};

module.exports = authMiddleware;
