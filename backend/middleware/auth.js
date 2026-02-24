const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Owner = require('../models/Owner');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;

    if (decoded.role === 'user') {
      req.user = await User.findById(decoded.id);
    } else if (decoded.role === 'owner') {
      req.user = await Owner.findById(decoded.id);
    } else if (decoded.role === 'admin') {
      req.user = await Admin.findById(decoded.id);
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access only' });
  }
  next();
};

const ownerOnly = (req, res, next) => {
  if (req.userRole !== 'owner') {
    return res.status(403).json({ success: false, message: 'Owner access only' });
  }
  next();
};

module.exports = { protect, adminOnly, ownerOnly };
