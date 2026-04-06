const Booking = require('../models/Booking');
const Station = require('../models/Station');
const Bill = require('../models/Bill');
const Session = require('../models/Session');

// Helper: resolve booking for current user (owner of station or admin can act on any)
const getBookingForAction = async (bookingId, userId, userRole) => {
  const booking = await Booking.findById(bookingId).populate('station', 'owner');
  if (!booking) return null;
  if (userRole === 'admin') return booking;
  if (booking.user && booking.user.toString() === userId) return booking;
  if (userRole === 'owner' && booking.station && booking.station.owner && booking.station.owner.toString() === userId) return booking;
  return null;
};

// @desc    Create a new booking
// @route   POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const { stationId, startTime, endTime } = req.body;

    const station = await Station.findById(stationId);
    if (!station || station.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Station not available' });
    }

    const booking = await Booking.create({
      user: req.userId,
      station: stationId,
      startTime,
      endTime,
    });

    const populated = await Booking.findById(booking._id)
      .populate('station', 'name location pricePerKwh');

    res.status(201).json({ success: true, booking: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.userId })
      .populate('station', 'name location pricePerKwh')
      .sort({ startTime: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single booking
// @route   GET /api/bookings/:id
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.userId })
      .populate('station', 'name location pricePerKwh');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Start charging (change status to ACTIVE). User, owner, or admin.
// @route   PUT /api/bookings/:id/start
exports.startCharging = async (req, res, next) => {
  try {
    const booking = await getBookingForAction(req.params.id, req.userId, req.userRole);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'BOOKED') {
      return res.status(400).json({ success: false, message: `Cannot start charging, current status: ${booking.status}` });
    }

    booking.status = 'ACTIVE';
    await booking.save();

    // Create an IoT session record
    await Session.create({ booking: booking._id });

    const populated = await Booking.findById(booking._id)
      .populate('station', 'name location pricePerKwh');

    res.json({ success: true, booking: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Stop charging (complete booking, generate bill). User, owner, or admin.
// @route   PUT /api/bookings/:id/stop
exports.stopCharging = async (req, res, next) => {
  try {
    const { energyKwh, cost } = req.body;
    const booking = await getBookingForAction(req.params.id, req.userId, req.userRole);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Booking is not active' });
    }

    let finalEnergyKwh = typeof energyKwh === 'number' ? energyKwh : null;
    let finalCost = typeof cost === 'number' ? cost : null;

    if (finalEnergyKwh === null || finalCost === null) {
      const session = await Session.findOne({ booking: booking._id });

      if (finalEnergyKwh === null) {
        finalEnergyKwh = session?.energyKwh ?? booking.energyKwh ?? 0;
      }

      if (finalCost === null) {
        if (session?.cost !== undefined && session?.cost !== null) {
          finalCost = session.cost;
        } else {
          const station = await Station.findById(booking.station).select('pricePerKwh');
          const pricePerKwh = station?.pricePerKwh ?? 0;
          finalCost = (finalEnergyKwh || 0) * pricePerKwh;
        }
      }
    }

    booking.status = 'COMPLETED';
    booking.energyKwh = finalEnergyKwh || 0;
    booking.cost = finalCost || 0;
    await booking.save();

    const bill = await Bill.create({
      user: booking.user,
      booking: booking._id,
      amount: finalCost || 0,
      unitsKwh: finalEnergyKwh || 0,
    });

    // Update the session
    await Session.findOneAndUpdate(
      { booking: booking._id },
      { energyKwh: finalEnergyKwh || 0, cost: finalCost || 0 }
    );

    res.json({ success: true, booking, bill });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking. User, owner, or admin.
// @route   PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await getBookingForAction(req.params.id, req.userId, req.userRole);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'BOOKED') {
      return res.status(400).json({ success: false, message: 'Only BOOKED status can be cancelled' });
    }

    booking.status = 'CANCELLED';
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};
