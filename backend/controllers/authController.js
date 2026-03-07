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

// @desc    Verify MSG91 widget or REST OTP - login or register user
// @route   POST /api/auth/verify-msg91-token
// Flow A (widget): otp === "WIDGET" + accessToken → trust widget, skip MSG91 API
// Flow B (REST):  otp is digits → verify via MSG91 API (for mobile/manual flow)
exports.verifyMsg91Token = async (req, res, next) => {
  try {
    const { vehicleNumber, mobileNumber, accessToken, otp, intent } = req.body;
    const mode = intent === 'login' ? 'login' : 'signup';

    if (!vehicleNumber || !mobileNumber) {
      return res.status(400).json({ success: false, message: 'Vehicle number and mobile number are required' });
    }

    const normalized = normalizeVehicleNumber(vehicleNumber);

    // Flow A: MSG91 widget (website) - trust widget verification, skip server-side MSG91 API
    if (otp === 'WIDGET' && accessToken) {
      // Widget already verified OTP client-side; token is proof of verification
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

      console.log(`[Auth] User ${mode === 'login' ? 'Login' : 'Signup'} Success (MSG91 widget): ${mobileNumber} (${vehicleNumber})`);

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
    }

    // Flow B: REST API verification (for mobile/manual OTP - future use)
    if (!MSG91_AUTHKEY) {
      return res.status(500).json({ success: false, message: 'MSG91 not configured' });
    }

    if (!accessToken && !otp) {
      return res.status(400).json({ success: false, message: 'accessToken (widget) or otp (REST) required' });
    }

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
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const isValid = verifyRes.ok && (verifyData?.request_id || verifyData?.type === 'success');
    if (!isValid) {
      const msg = verifyData?.message || verifyData?.description || verifyData?.error || 'Invalid or expired OTP';
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

    console.log(`[Auth] User ${mode === 'login' ? 'Login' : 'Signup'} Success (MSG91): ${mobileNumber} (${vehicleNumber})`);

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
