const Session = require('../models/Session');
const Booking = require('../models/Booking');

const PRICE_PER_KWH = 10;

// @desc    Get live session data for an active booking
// @route   GET /api/sessions/:bookingId
exports.getSessionByBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    let session = await Session.findOne({ booking: req.params.bookingId });

    if (!session) {
      session = await Session.create({ booking: req.params.bookingId });
    }

    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

// @desc    Update session with IoT data (simulate or receive from hardware)
// @route   PUT /api/sessions/:bookingId
exports.updateSession = async (req, res, next) => {
  try {
    const { voltage, current, energyKwh } = req.body;
    const cost = (energyKwh || 0) * PRICE_PER_KWH;

    const session = await Session.findOneAndUpdate(
      { booking: req.params.bookingId },
      { voltage, current, energyKwh, cost },
      { new: true, upsert: true }
    );

    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

// @desc    Get live data — returns real IoT data if available, otherwise simulates
// @route   GET /api/sessions/:bookingId/live
exports.getLiveData = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    let session = await Session.findOne({ booking: req.params.bookingId });

    // If session exists and was updated by real IoT within last 10 seconds, return it directly
    if (session && session.source === 'iot') {
      const ageMs = Date.now() - new Date(session.updatedAt).getTime();
      if (ageMs < 10000) {
        return res.json({
          success: true,
          source: 'iot',
          data: {
            voltage: session.voltage.toFixed(1),
            current: session.current.toFixed(2),
            power: session.power.toFixed(2),
            energyKwh: session.energyKwh.toFixed(3),
            frequency: session.frequency.toFixed(1),
            powerFactor: session.powerFactor.toFixed(2),
            cost: session.cost.toFixed(2),
          },
        });
      }
    }

    // Fallback: simulate data
    const voltage = Math.floor(Math.random() * (250 - 210 + 1)) + 210;
    let currentAmp = 0;
    let energyKwh = session ? session.energyKwh : 0;
    let cost = 0;

    if (booking.status === 'ACTIVE') {
      currentAmp = parseFloat((Math.random() * (16 - 8) + 8).toFixed(2));
      const increment = ((currentAmp * voltage) / 1000) * (3 / 3600);
      energyKwh += increment;
      cost = energyKwh * PRICE_PER_KWH;

      session = await Session.findOneAndUpdate(
        { booking: req.params.bookingId },
        { voltage, current: currentAmp, energyKwh, cost, source: 'simulated' },
        { new: true, upsert: true }
      );
    }

    res.json({
      success: true,
      source: 'simulated',
      data: {
        voltage: voltage.toFixed(1),
        current: currentAmp.toFixed(2),
        power: (voltage * currentAmp).toFixed(2),
        energyKwh: energyKwh.toFixed(3),
        frequency: '50.0',
        powerFactor: currentAmp > 0 ? '0.95' : '0.00',
        cost: cost.toFixed(2),
      },
    });
  } catch (error) {
    next(error);
  }
};
