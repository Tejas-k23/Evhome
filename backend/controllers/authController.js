const User = require('../models/User');
const { generateToken, normalizeVehicleNumber } = require('../utils/helpers');

const MSG91_AUTHKEY = process.env.MSG91_AUTHKEY;

// @desc    Validate vehicle+mobile before MSG91 widget (signup: user must not exist; login: user must exist)
// @route   POST /api/auth/validate-for-otp
exports.validateForOtp = async (req, res, next) => {
  try {
    const { vehicleNumber, mobileNumber, intent } = req.body;
    const mode = intent === 'login' ? 'login' : 'signup';

    if (!vehicleNumber || !mobileNumber) {
      return res.status(400).json({ success: false, message: 'Vehicle number and mobile number are required' });
    }

    const normalized = normalizeVehicleNumber(vehicleNumber);

    if (mode === 'login') {
      const user = await User.findOne({ vehicleNumber: normalized, mobileNumber });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'No account found with this vehicle and mobile number. Please sign up first.',
        });
      }
    }

    if (mode === 'signup') {
      const existingUser = await User.findOne({ vehicleNumber: normalized });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Already registered with this vehicle number. Please login instead.',
        });
      }
    }

    res.json({ success: true, message: 'Validation passed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify MSG91 widget OTP token - login or register user
// @route   POST /api/auth/verify-msg91-token
exports.verifyMsg91Token = async (req, res, next) => {
  try {
    const { vehicleNumber, mobileNumber, accessToken, intent } = req.body;
    const mode = intent === 'login' ? 'login' : 'signup';

    if (!vehicleNumber || !mobileNumber) {
      return res.status(400).json({ success: false, message: 'Vehicle number and mobile number are required' });
    }

    const normalized = normalizeVehicleNumber(vehicleNumber);

    if (!MSG91_AUTHKEY) {
      return res.status(500).json({ success: false, message: 'MSG91 not configured on server' });
    }

    if (!accessToken) {
      return res.status(400).json({ success: false, message: 'accessToken is required for verification' });
    }

    // Verify token with MSG91 Server-Side API to ensure it wasn't intercepted/forged
    const verifyRes = await fetch('https://control.msg91.com/api/v5/widget/verifyAccessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authkey: MSG91_AUTHKEY,
        'access-token': accessToken,
      }),
    });

    let verifyData;
    try {
      verifyData = await verifyRes.json();
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP token response' });
    }

    const isValid = verifyRes.ok && (verifyData?.request_id || verifyData?.type === 'success' || verifyData?.message === 'Token verified');
    if (!isValid) {
      const msg = verifyData?.message || verifyData?.description || verifyData?.error || 'Invalid or expired OTP token';
      return res.status(400).json({ success: false, message: msg });
    }

    let user = await User.findOne({ vehicleNumber: normalized });

    if (mode === 'login') {
      if (!user || user.mobileNumber !== mobileNumber) {
        return res.status(400).json({
          success: false,
          message: 'No account found. Please sign up first.',
        });
      }
      user.lastActiveAt = new Date();
      await user.save();
    } else {
      if (user) {
        return res.status(400).json({
          success: false,
          message: 'Already registered with this vehicle number. Please login instead.',
        });
      }
      user = await User.create({
        vehicleNumber: normalized,
        mobileNumber,
      });
    }

    console.log(`[Auth] User ${mode === 'login' ? 'Login' : 'Signup'} Success (MSG91 Verified): ${mobileNumber} (${vehicleNumber})`);

    return res.json({
      success: true,
      user: {
        id: user._id,
        vehicleNumber: user.vehicleNumber,
        mobileNumber: user.mobileNumber,
        name: user.name,
        createdAt: user.createdAt,
      },
      token: generateToken(user._id, 'user'),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
