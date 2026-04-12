const Session = require('../models/Session');
const Booking = require('../models/Booking');
const Station = require('../models/Station');

const PRICE_PER_KWH = 10;

const deriveDeviceState = (voltageValue, currentValue) => {
  const voltage = Number(voltageValue || 0);
  const current = Number(currentValue || 0);

  if (voltage === 0) return 'POWER_CUT';
  if (voltage > 0 && current === 0) return 'DEVICE_OFF';
  if (voltage > 0 && current > 0) return 'DEVICE_ON';
  return 'UNKNOWN';
};

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
        const state = deriveDeviceState(session.voltage, session.current);
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
            state,
          },
        });
      }
    }

    const station = await Station.findById(booking.station).select('iotApiKey');
    const iotConfigured = !!station?.iotApiKey;
    const sessionIsIot = session?.source === 'iot';

    // If IoT is configured, do NOT simulate phantom usage when data is stale.
    if (iotConfigured || sessionIsIot) {
      const state = deriveDeviceState(session?.voltage, session?.current);
      const data = session
        ? {
            voltage: Number(session.voltage || 0).toFixed(1),
            current: Number(session.current || 0).toFixed(2),
            power: Number(session.power || 0).toFixed(2),
            energyKwh: Number(session.energyKwh || 0).toFixed(3),
            frequency: Number(session.frequency || 0).toFixed(1),
            powerFactor: Number(session.powerFactor || 0).toFixed(2),
            cost: Number(session.cost || 0).toFixed(2),
            state,
          }
        : {
            voltage: '0.0',
            current: '0.00',
            power: '0.00',
            energyKwh: '0.000',
            frequency: '0.0',
            powerFactor: '0.00',
            cost: '0.00',
            state: 'POWER_CUT',
          };

      return res.json({
        success: true,
        source: 'iot-stale',
        stale: true,
        lastUpdatedAt: session?.updatedAt || null,
        data,
      });
    }

    // Fallback: simulate data (non-IoT stations)
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
        state: deriveDeviceState(voltage, currentAmp),
      },
    });
  } catch (error) {
    next(error);
  }
};
