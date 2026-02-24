const express = require('express');
const router = express.Router();
const { getAllStations, getStationById, searchStations } = require('../controllers/stationController');

router.get('/search', searchStations);
router.get('/', getAllStations);
router.get('/:id', getStationById);

module.exports = router;
