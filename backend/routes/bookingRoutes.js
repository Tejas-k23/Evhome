const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createBooking,
  getUserBookings,
  getBookingById,
  startCharging,
  stopCharging,
  cancelBooking,
} = require('../controllers/bookingController');

router.use(protect);

router.post('/', createBooking);
router.get('/', getUserBookings);
router.get('/:id', getBookingById);
router.put('/:id/start', startCharging);
router.put('/:id/stop', stopCharging);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
