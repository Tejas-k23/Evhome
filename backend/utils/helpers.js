const jwt = require('jsonwebtoken');

const generateToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const normalizeVehicleNumber = (v) => v.toUpperCase().replace(/\s+/g, ' ').trim();

module.exports = { generateToken, normalizeVehicleNumber };
