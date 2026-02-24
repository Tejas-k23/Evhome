const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSessionByBooking, updateSession, getLiveData } = require('../controllers/sessionController');

router.use(protect);

router.get('/:bookingId', getSessionByBooking);
router.put('/:bookingId', updateSession);
router.get('/:bookingId/live', getLiveData);

module.exports = router;
