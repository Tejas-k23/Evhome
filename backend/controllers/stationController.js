const Station = require('../models/Station');

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
