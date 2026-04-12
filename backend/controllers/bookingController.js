const Booking = require('../models/Booking');
const Station = require('../models/Station');
const Socket = require('../models/Socket');
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

const isSocketBookedForWindow = async (socketId, startTime, endTime) => {
  if (!startTime || !endTime) return false;

  return Booking.exists({
    socket: socketId,
    status: { $in: ['BOOKED', 'ACTIVE'] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  });
};

const resolveBookingSocket = async ({ station, socketId, startTime, endTime }) => {
  const sockets = await ensureSocketsForStation(station);

  if (socketId) {
    const requested = sockets.find((s) => s._id.toString() === socketId.toString());
    if (!requested) {
      return { error: 'Selected socket is not part of this station.', socket: null };
    }
    if (requested.status !== 'AVAILABLE') {
      return { error: 'Selected socket is not available.', socket: null };
    }
    const hasOverlap = await isSocketBookedForWindow(requested._id, startTime, endTime);
    if (hasOverlap) {
      return { error: 'Selected socket is already booked for this time window.', socket: null };
    }
    return { socket: requested, error: null };
  }

  for (const socket of sockets) {
    if (socket.status !== 'AVAILABLE') continue;
    const hasOverlap = await isSocketBookedForWindow(socket._id, startTime, endTime);
    if (!hasOverlap) {
      return { socket, error: null };
    }
  }

  return { socket: null, error: 'No available sockets for this time window.' };
};

const isValidDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());

// @desc    Create a new booking
// @route   POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const { stationId, socketId, startTime, endTime } = req.body;

    const station = await Station.findById(stationId);
    if (!station || station.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Station not available' });
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return res.status(400).json({ success: false, message: 'Invalid start or end time' });
    }

    const { socket, error: socketError } = await resolveBookingSocket({
      station,
      socketId,
      startTime: startDate,
      endTime: endDate,
    });
    if (!socket) {
      return res.status(409).json({ success: false, message: socketError || 'No socket available' });
    }

    const booking = await Booking.create({
      user: req.userId,
      station: stationId,
      socket: socket._id,
      startTime,
      endTime,
    });

    const populated = await Booking.findById(booking._id)
      .populate('station', 'name location pricePerKwh')
      .populate('socket', 'socketNumber status');

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

    if (booking.status === 'ACTIVE') {
      if (booking.socket) {
        await Socket.findByIdAndUpdate(booking.socket, { status: 'OCCUPIED' });
      }
      return res.json({ success: true, booking, message: 'Session already active' });
    }

    if (booking.status !== 'BOOKED') {
      return res.status(400).json({ success: false, message: `Cannot start charging, current status: ${booking.status}` });
    }

    if (!booking.socket) {
      const stationId = booking.station?._id || booking.station;
      const stationForSocket = await Station.findById(stationId);
      if (!stationForSocket) {
        return res.status(400).json({ success: false, message: 'Station not available' });
      }

      const { socket, error: socketError } = await resolveBookingSocket({
        station: stationForSocket,
        socketId: null,
        startTime: booking.startTime ? new Date(booking.startTime) : null,
        endTime: booking.endTime ? new Date(booking.endTime) : null,
      });

      if (!socket) {
        return res.status(409).json({ success: false, message: socketError || 'No socket available' });
      }

      booking.socket = socket._id;
    }

    const HEARTBEAT_STALE_MS = 5 * 60 * 1000;
    const DATA_STALE_MS = 10 * 60 * 1000;
    const now = new Date();

    const stationId = booking.station?._id || booking.station;
    const station = await Station.findById(stationId).select('lastHeartbeatAt lastDataAt iotApiKey');
    const iotConfigured = !!station?.iotApiKey;
    const heartbeatActive = iotConfigured && station?.lastHeartbeatAt
      ? now - new Date(station.lastHeartbeatAt) <= HEARTBEAT_STALE_MS
      : false;
    const dataActive = iotConfigured && station?.lastDataAt
      ? now - new Date(station.lastDataAt) <= DATA_STALE_MS
      : false;

    const isAdmin = req.userRole === 'admin';
    const isOwner = req.userRole === 'owner';
    const isUser = !isOwner && !isAdmin;

    if (isUser && iotConfigured && !heartbeatActive) {
      return res.status(400).json({
        success: false,
        message: 'Station heartbeat is inactive. Please wait for the device to come online.',
      });
    }

    if (!booking.sessionInitiatedAt) {
      booking.sessionInitiatedAt = now;
      booking.sessionInitiatedBy = isOwner || isAdmin ? 'owner' : 'user';
    }

    if ((isOwner || isAdmin) && !booking.ownerStartedAt) {
      booking.ownerStartedAt = now;
    }

    if (isUser && !booking.userStartedAt) {
      booking.userStartedAt = now;
    }

    const ownerReady = !!booking.ownerStartedAt;
    const userReady = !!booking.userStartedAt;
    const userCanBypassOwner = isUser && userReady && dataActive;

    const startWindow = booking.startTime ? new Date(booking.startTime) : null;
    const endWindow = booking.endTime ? new Date(booking.endTime) : null;
    const withinWindow = startWindow && endWindow
      ? now >= startWindow && now <= endWindow
      : true;

    if (withinWindow) {
      if (userReady && (ownerReady || userCanBypassOwner)) {
        booking.status = 'ACTIVE';
      }
    } else {
      if (ownerReady && userReady) {
        booking.status = 'ACTIVE';
      }
    }

    await booking.save();

    if (booking.status === 'ACTIVE') {
      if (booking.socket) {
        await Socket.findByIdAndUpdate(booking.socket, { status: 'OCCUPIED' });
      }
      const existingSession = await Session.findOne({ booking: booking._id });
      if (!existingSession) {
        await Session.create({
          booking: booking._id,
          startedAt: booking.sessionInitiatedAt || now,
          startedBy: booking.sessionInitiatedBy || (isOwner || isAdmin ? 'owner' : 'user'),
          source: 'manual',
        });
      } else if (!existingSession.startedAt) {
        existingSession.startedAt = booking.sessionInitiatedAt || now;
        existingSession.startedBy = booking.sessionInitiatedBy || (isOwner || isAdmin ? 'owner' : 'user');
        await existingSession.save();
      }
    }

    const populated = await Booking.findById(booking._id)
      .populate('station', 'name location pricePerKwh');

    const message = booking.status === 'ACTIVE'
      ? 'Session started'
      : withinWindow
        ? 'Initiation recorded. Waiting for the other party to start.'
        : 'Outside booking time. Both owner and user must start to activate.';

    res.json({ success: true, booking: populated, message });
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
