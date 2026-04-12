const express = require('express');
const router = express.Router();
const { getAllStations, getStationById, searchStations, getStationSockets } = require('../controllers/stationController');

router.get('/search', searchStations);
router.get('/', getAllStations);
router.get('/:id/sockets', getStationSockets);
router.get('/:id', getStationById);

module.exports = router;
