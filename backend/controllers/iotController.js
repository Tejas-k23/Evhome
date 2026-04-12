const Station = require('../models/Station');
const Socket = require('../models/Socket');
const Booking = require('../models/Booking');
const Session = require('../models/Session');

// Middleware: authenticate IoT device via X-API-Key header
exports.authenticateDevice = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ success: false, message: 'Missing API key' });
    }

    const station = await Station.findOne({ iotApiKey: apiKey });
    if (!station) {
      return res.status(401).json({ success: false, message: 'Invalid API key' });
    }

    req.station = station;
    next();
  } catch (error) {
    next(error);
  }
};

// @desc    Receive live energy data from ESP32
// @route   POST /api/iot/data
exports.pushData = async (req, res, next) => {
  try {
    const station = req.station;
    const { socketNumber, voltage, current, power, energy, frequency, pf } = req.body;

    if (socketNumber === undefined) {
      return res.status(400).json({ success: false, message: 'socketNumber is required' });
    }

    const socket = await Socket.findOne({ station: station._id, socketNumber });
    if (!socket) {
      return res.status(404).json({ success: false, message: 'Socket not found' });
    }

    const now = new Date();
    station.lastDataAt = now;
    station.lastHeartbeatAt = now;
    await station.save();

    // Find active booking for this station + socket
    let activeBooking = await Booking.findOne({
      station: station._id,
      socket: socket._id,
      status: 'ACTIVE',
    });

    // Fallback: if booking exists but socket not assigned yet,
    // bind the single active booking to this socket.
    if (!activeBooking) {
      const unassignedActive = await Booking.find({
        station: station._id,
        socket: null,
        status: 'ACTIVE',
      });

      if (unassignedActive.length === 1) {
        activeBooking = unassignedActive[0];
        activeBooking.socket = socket._id;
        await activeBooking.save();
      }
    }

    if (!activeBooking) {
      // No active booking — still accept data but flag it
      return res.json({
        success: true,
        message: 'Data received, no active booking on this socket',
        hasActiveBooking: false,
      });
    }

    const cost = (energy || 0) * station.pricePerKwh;

    const session = await Session.findOneAndUpdate(
      { booking: activeBooking._id },
      {
        voltage: voltage || 0,
        current: current || 0,
        power: power || 0,
        energyKwh: energy || 0,
        frequency: frequency || 0,
        powerFactor: pf || 0,
        cost,
        source: 'iot',
      },
      { new: true, upsert: true }
    );

    // Sync energy/cost back to the booking
    activeBooking.energyKwh = energy || 0;
    activeBooking.cost = cost;
    await activeBooking.save();

    res.json({ success: true, session, hasActiveBooking: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Get WiFi config + station info for ESP32
// @route   GET /api/iot/config
exports.getConfig = async (req, res, next) => {
  try {
    const station = req.station;
    const sortedNetworks = [...station.wifiNetworks].sort((a, b) => a.priority - b.priority);

    res.json({
      success: true,
      config: {
        stationId: station._id,
        stationName: station.name,
        pricePerKwh: station.pricePerKwh,
        socketCount: station.socketCount,
        wifiNetworks: sortedNetworks.map((n) => ({
          ssid: n.ssid,
          password: n.password,
          priority: n.priority,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Heartbeat endpoint — ESP32 pings to confirm it's online
// @route   POST /api/iot/heartbeat
exports.heartbeat = async (req, res, next) => {
  try {
    const station = req.station;
    station.lastHeartbeatAt = new Date();
    await station.save();

    res.json({
      success: true,
      serverTime: new Date().toISOString(),
      stationId: req.station._id,
    });
  } catch (error) {
    next(error);
  }
};
