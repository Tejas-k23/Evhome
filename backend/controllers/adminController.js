const Admin = require('../models/Admin');
const User = require('../models/User');
const Station = require('../models/Station');
const Booking = require('../models/Booking');
const Bill = require('../models/Bill');
const { generateToken } = require('../utils/helpers');

// @desc    Admin login with secret key (creates admin on first login)
// @route   POST /api/admin/login
exports.loginAdmin = async (req, res, next) => {
  try {
    const { key, email, password } = req.body;

    // Secret key based login (legacy, matching frontend mock)
    if (key) {
      if (key !== process.env.ADMIN_SECRET_KEY) {
        return res.status(401).json({ success: false, message: 'Invalid Admin Key' });
      }

      let admin = await Admin.findOne({ role: 'superadmin' });
      if (!admin) {
        admin = await Admin.create({
          email: 'admin@evhome.com',
          password: 'Admin@123',
          role: 'superadmin',
        });
      }

      return res.json({
        success: true,
        token: generateToken(admin._id, 'admin'),
      });
    }

    // Email/password login
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: generateToken(admin._id, 'admin'),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalStations, totalBookings, bills] = await Promise.all([
      User.countDocuments(),
      Station.countDocuments(),
      Booking.countDocuments(),
      Bill.find(),
    ]);

    const totalRevenue = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const activeBookings = await Booking.countDocuments({ status: 'ACTIVE' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalStations,
        totalBookings,
        activeBookings,
        totalRevenue,
        totalBills: bills.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (admin)
// @route   GET /api/admin/bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'vehicleNumber mobileNumber')
      .populate('station', 'name location')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bills (admin)
// @route   GET /api/admin/bills
exports.getAllBills = async (req, res, next) => {
  try {
    const bills = await Bill.find()
      .populate('user', 'vehicleNumber mobileNumber')
      .populate('booking', 'startTime endTime status')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bills.length, bills });
  } catch (error) {
    next(error);
  }
};

// @desc    CRUD Stations (admin) - Create
// @route   POST /api/admin/stations
exports.createStation = async (req, res, next) => {
  try {
    const station = await Station.create(req.body);
    res.status(201).json({ success: true, station });
  } catch (error) {
    next(error);
  }
};

// @desc    CRUD Stations (admin) - Update
// @route   PUT /api/admin/stations/:id
exports.updateStation = async (req, res, next) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    res.json({ success: true, station });
  } catch (error) {
    next(error);
  }
};

// @desc    CRUD Stations (admin) - Delete
// @route   DELETE /api/admin/stations/:id
exports.deleteStation = async (req, res, next) => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    res.json({ success: true, message: 'Station deleted' });
  } catch (error) {
    next(error);
  }
};
