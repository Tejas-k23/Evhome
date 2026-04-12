const Station = require('../models/Station');
const Socket = require('../models/Socket');
const Booking = require('../models/Booking');

const ensureSocketsForStation = async (station) => {
  let sockets = await Socket.find({ station: station._id }).sort({ socketNumber: 1 });

  if (sockets.length === 0) {
    const socketDocs = [];
    for (let i = 1; i <= station.socketCount; i++) {
      socketDocs.push({ station: station._id, socketNumber: i, status: 'AVAILABLE' });
    }
    sockets = await Socket.insertMany(socketDocs);
  }

  return sockets;
};

const isValidDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());

// @desc    Get all active stations (public)
// @route   GET /api/stations
exports.getAllStations = async (req, res, next) => {
  try {
    const stations = await Station.find({ status: 'ACTIVE' }).sort({ createdAt: -1 });
    res.json({ success: true, count: stations.length, stations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get station by ID (public)
// @route   GET /api/stations/:id
exports.getStationById = async (req, res, next) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    res.json({ success: true, station });
  } catch (error) {
    next(error);
  }
};

// @desc    Search stations by location (public)
// @route   GET /api/stations/search?q=keyword
exports.searchStations = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const stations = await Station.find({
      status: 'ACTIVE',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
      ],
    });

    res.json({ success: true, count: stations.length, stations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sockets for a station (public, optionally time-filtered)
// @route   GET /api/stations/:id/sockets?startTime=...&endTime=...
exports.getStationSockets = async (req, res, next) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    const sockets = await ensureSocketsForStation(station);

    const startTime = req.query.startTime ? new Date(req.query.startTime) : null;
    const endTime = req.query.endTime ? new Date(req.query.endTime) : null;
    const hasWindow = isValidDate(startTime) && isValidDate(endTime);

    const enriched = await Promise.all(
      sockets.map(async (socket) => {
        let isBookable = socket.status === 'AVAILABLE';
        if (isBookable && hasWindow) {
          const hasOverlap = await Booking.exists({
            socket: socket._id,
            status: { $in: ['BOOKED', 'ACTIVE'] },
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
          });
          if (hasOverlap) isBookable = false;
        }

        return {
          ...socket.toObject(),
          isBookable,
        };
      })
    );

    res.json({ success: true, sockets: enriched });
  } catch (error) {
    next(error);
  }
};
