const User = require('../models/User');
const { generateToken, normalizeVehicleNumber } = require('../utils/helpers');

// In production, integrate Twilio / MSG91 for real OTP
const OTP_STORE = new Map();
const TEST_OTP = '123456';

// @desc    Send OTP to mobile number (signup or login)
// @route   POST /api/auth/send-otp
exports.sendOtp = async (req, res, next) => {
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

    const otp = TEST_OTP;
    OTP_STORE.set(mobileNumber, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    console.log(`[Auth] OTP requested for ${mobileNumber} (${vehicleNumber}) [${mode}]`);
    res.json({
      success: true,
      message: 'OTP sent successfully',
      testOtp: process.env.NODE_ENV !== 'production' ? TEST_OTP : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and login or register user (signup vs login enforced)
// @route   POST /api/auth/verify-otp
exports.verifyOtp = async (req, res, next) => {
  try {
    const { vehicleNumber, mobileNumber, otp, intent } = req.body;
    const mode = intent === 'login' ? 'login' : 'signup';

    if (!vehicleNumber || !mobileNumber || !otp) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const stored = OTP_STORE.get(mobileNumber);
    const isValid = otp === TEST_OTP || (stored && stored.otp === otp && stored.expiresAt > Date.now());

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    OTP_STORE.delete(mobileNumber);

    const normalized = normalizeVehicleNumber(vehicleNumber);
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
      // signup
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

    console.log(`[Auth] User ${mode === 'login' ? 'Login' : 'Signup'} Success: ${mobileNumber} (${vehicleNumber})`);

    res.json({
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
