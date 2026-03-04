const User = require('../models/User');
const { generateToken, normalizeVehicleNumber } = require('../utils/helpers');

const POSTCODER_API_KEY = process.env.POSTCODER_API_KEY;
const POSTCODER_BASE = `https://ws.postcoder.com/pcw/${POSTCODER_API_KEY}/otp`;

const OTP_FROM_NAME = 'GotNexus';
const OTP_MESSAGE = 'Your GotNexus verification code is [otp]. It will expire in [expiry] minutes. Do not share this code.';
const OTP_LENGTH = 6;
const OTP_EXPIRY = 5;

async function postcderSendOtp(mobileNumber) {
  const res = await fetch(`${POSTCODER_BASE}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: mobileNumber,
      from: OTP_FROM_NAME,
      message: OTP_MESSAGE,
      otplength: OTP_LENGTH,
      expiry: OTP_EXPIRY,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Postcoder send failed: ${text}`);
  }
  return res.json();
}

async function postcderVerifyOtp(id, otp) {
  const res = await fetch(`${POSTCODER_BASE}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: encodeURIComponent(id),
      otp: encodeURIComponent(otp),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Postcoder verify failed: ${text}`);
  }
  return res.json();
}

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

    if (mode === 'signup') {
      const existingUser = await User.findOne({ vehicleNumber: normalized });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Already registered with this vehicle number. Please login instead.',
        });
      }
    }

    const postcderRes = await postcderSendOtp(mobileNumber);

    console.log(`[Auth] OTP sent via Postcoder for ${mobileNumber} (${vehicleNumber}) [${mode}]`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      otpId: postcderRes.id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and login or register user (signup vs login enforced)
// @route   POST /api/auth/verify-otp
exports.verifyOtp = async (req, res, next) => {
  try {
    const { vehicleNumber, mobileNumber, otp, otpId, intent } = req.body;
    const mode = intent === 'login' ? 'login' : 'signup';

    if (!vehicleNumber || !mobileNumber || !otp || !otpId) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const verifyRes = await postcderVerifyOtp(otpId, otp);

    if (!verifyRes.valid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

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
