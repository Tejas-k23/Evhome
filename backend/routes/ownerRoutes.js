const express = require('express');
const router = express.Router();
const { protect, ownerOnly } = require('../middleware/auth');
const {
  loginOwner,
  registerOwner,
  getOwnerProfile,
  getOwnerDashboard,
  getMyStations,
  createStation,
  updateStation,
  getStationSockets,
  updateSocketStatus,
  getOwnerBookings,
  getOwnerSessions,
  getOwnerRevenue,
  getStationWifi,
  updateStationWifi,
  regenerateApiKey,
} = require('../controllers/ownerController');

router.post('/login', loginOwner);
router.post('/register', registerOwner);

router.use(protect, ownerOnly);

router.get('/me', getOwnerProfile);
router.get('/dashboard', getOwnerDashboard);
router.get('/stations', getMyStations);
router.post('/stations', createStation);
router.put('/stations/:id', updateStation);
router.get('/stations/:id/sockets', getStationSockets);
router.get('/stations/:id/wifi', getStationWifi);
router.put('/stations/:id/wifi', updateStationWifi);
router.post('/stations/:id/api-key', regenerateApiKey);
router.put('/sockets/:id', updateSocketStatus);
router.get('/bookings', getOwnerBookings);
router.get('/sessions', getOwnerSessions);
router.get('/revenue', getOwnerRevenue);

module.exports = router;
