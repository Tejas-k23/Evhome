const Owner = require('../models/Owner');
const Station = require('../models/Station');
const Socket = require('../models/Socket');
const Booking = require('../models/Booking');
const Bill = require('../models/Bill');
const Session = require('../models/Session');
const { generateToken } = require('../utils/helpers');

// @desc    Owner login with email/password
// @route   POST /api/owner/login
exports.loginOwner = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const owner = await Owner.findOne({ email }).select('+password');
    if (!owner || !(await owner.matchPassword(password))) {
      console.log(`[Owner] Login Failed: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    console.log(`[Owner] Login Success: ${email}`);

    res.json({
      success: true,
      owner: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        mobileNumber: owner.mobileNumber,
      },
      token: generateToken(owner._id, 'owner'),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new owner
// @route   POST /api/owner/register
exports.registerOwner = async (req, res, next) => {
  try {
    const { name, email, mobileNumber, password } = req.body;
    const existing = await Owner.findOne({ $or: [{ email }, { mobileNumber }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Owner with this email or mobile already exists' });
    }

    const owner = await Owner.create({ name, email, mobileNumber, password });

    res.status(201).json({
      success: true,
      owner: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        mobileNumber: owner.mobileNumber,
      },
      token: generateToken(owner._id, 'owner'),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner profile
// @route   GET /api/owner/me
exports.getOwnerProfile = async (req, res, next) => {
  try {
    const owner = await Owner.findById(req.userId);
    if (!owner) return res.status(404).json({ success: false, message: 'Owner not found' });
    res.json({ success: true, owner });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner dashboard stats
// @route   GET /api/owner/dashboard
exports.getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.userId;
    const stations = await Station.find({ owner: ownerId });
    const stationIds = stations.map((s) => s._id);

    const [totalBookings, activeBookings, bills] = await Promise.all([
      Booking.countDocuments({ station: { $in: stationIds } }),
      Booking.countDocuments({ station: { $in: stationIds }, status: 'ACTIVE' }),
      Bill.find({ booking: { $in: await Booking.find({ station: { $in: stationIds } }).distinct('_id') } }),
    ]);

    const totalRevenue = bills.reduce((sum, b) => sum + b.amount, 0);

    res.json({
      success: true,
      stats: {
        totalStations: stations.length,
        totalBookings,
        activeBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's stations
// @route   GET /api/owner/stations
exports.getMyStations = async (req, res, next) => {
  try {
    const stations = await Station.find({ owner: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: stations.length, stations });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a station for the owner
// @route   POST /api/owner/stations
exports.createStation = async (req, res, next) => {
  try {
    const stationData = { ...req.body, owner: req.userId };
    const station = await Station.create(stationData);

    // Auto-generate sockets for the station
    const socketDocs = [];
    for (let i = 1; i <= station.socketCount; i++) {
      socketDocs.push({ station: station._id, socketNumber: i, status: 'AVAILABLE' });
    }
    await Socket.insertMany(socketDocs);

    res.status(201).json({ success: true, station });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a station
// @route   PUT /api/owner/stations/:id
exports.updateStation = async (req, res, next) => {
  try {
    const station = await Station.findOne({ _id: req.params.id, owner: req.userId });
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    Object.assign(station, req.body);
    await station.save();

    res.json({ success: true, station });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sockets for a station
// @route   GET /api/owner/stations/:id/sockets
exports.getStationSockets = async (req, res, next) => {
  try {
    const station = await Station.findOne({ _id: req.params.id, owner: req.userId });
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    let sockets = await Socket.find({ station: station._id }).sort({ socketNumber: 1 });

    // Auto-create sockets if none exist
    if (sockets.length === 0) {
      const socketDocs = [];
      for (let i = 1; i <= station.socketCount; i++) {
        socketDocs.push({ station: station._id, socketNumber: i, status: 'AVAILABLE' });
      }
      sockets = await Socket.insertMany(socketDocs);
    }

    res.json({ success: true, sockets });
  } catch (error) {
    next(error);
  }
};

// @desc    Update socket status
// @route   PUT /api/owner/sockets/:id
exports.updateSocketStatus = async (req, res, next) => {
  try {
    const socket = await Socket.findById(req.params.id).populate('station');
    if (!socket || socket.station.owner.toString() !== req.userId) {
      return res.status(404).json({ success: false, message: 'Socket not found' });
    }

    socket.status = req.body.status;
    await socket.save();

    res.json({ success: true, socket });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings for owner's stations
// @route   GET /api/owner/bookings
exports.getOwnerBookings = async (req, res, next) => {
  try {
    const stationIds = await Station.find({ owner: req.userId }).distinct('_id');
    const bookings = await Booking.find({ station: { $in: stationIds } })
      .populate('user', 'vehicleNumber mobileNumber')
      .populate('station', 'name location')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active sessions for owner's stations
// @route   GET /api/owner/sessions
exports.getOwnerSessions = async (req, res, next) => {
  try {
    const stationIds = await Station.find({ owner: req.userId }).distinct('_id');
    const activeBookings = await Booking.find({
      station: { $in: stationIds },
      status: 'ACTIVE',
    }).populate('user', 'vehicleNumber mobileNumber').populate('station', 'name');

    const bookingIds = activeBookings.map((b) => b._id);
    const sessions = await Session.find({ booking: { $in: bookingIds } });

    const enriched = activeBookings.map((booking) => {
      const session = sessions.find((s) => s.booking.toString() === booking._id.toString());
      return { booking, session: session || null };
    });

    res.json({ success: true, sessions: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc    Get WiFi config for a station
// @route   GET /api/owner/stations/:id/wifi
exports.getStationWifi = async (req, res, next) => {
  try {
    const station = await Station.findOne({ _id: req.params.id, owner: req.userId });
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    res.json({
      success: true,
      wifiNetworks: station.wifiNetworks,
      iotApiKey: station.iotApiKey || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update WiFi networks for a station (max 3)
// @route   PUT /api/owner/stations/:id/wifi
exports.updateStationWifi = async (req, res, next) => {
  try {
    const station = await Station.findOne({ _id: req.params.id, owner: req.userId });
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    const { wifiNetworks } = req.body;

    if (!Array.isArray(wifiNetworks) || wifiNetworks.length === 0) {
      return res.status(400).json({ success: false, message: 'Provide at least 1 WiFi network' });
    }
    if (wifiNetworks.length > 3) {
      return res.status(400).json({ success: false, message: 'Maximum 3 WiFi networks allowed' });
    }

    for (const net of wifiNetworks) {
      if (!net.ssid || !net.password) {
        return res.status(400).json({ success: false, message: 'Each network needs ssid and password' });
      }
    }

    station.wifiNetworks = wifiNetworks.map((n, i) => ({
      ssid: n.ssid,
      password: n.password,
      priority: n.priority || i + 1,
    }));
    await station.save();

    res.json({ success: true, wifiNetworks: station.wifiNetworks });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate or regenerate IoT API key for a station
// @route   POST /api/owner/stations/:id/api-key
exports.regenerateApiKey = async (req, res, next) => {
  try {
    const station = await Station.findOne({ _id: req.params.id, owner: req.userId });
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    const apiKey = station.generateApiKey();
    await station.save();

    res.json({ success: true, iotApiKey: apiKey });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue and bills for owner's stations
// @route   GET /api/owner/revenue
exports.getOwnerRevenue = async (req, res, next) => {
  try {
    const stationIds = await Station.find({ owner: req.userId }).distinct('_id');
    const bookingIds = await Booking.find({ station: { $in: stationIds } }).distinct('_id');
    const bills = await Bill.find({ booking: { $in: bookingIds } })
      .populate('user', 'vehicleNumber mobileNumber')
      .populate({
        path: 'booking',
        select: 'startTime endTime station',
        populate: { path: 'station', select: 'name' },
      })
      .sort({ createdAt: -1 });

    const totalRevenue = bills.reduce((sum, b) => sum + b.amount, 0);

    res.json({ success: true, totalRevenue, count: bills.length, bills });
  } catch (error) {
    next(error);
  }
};
