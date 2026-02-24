const express = require('express');
const router = express.Router();
const { authenticateDevice, pushData, getConfig, heartbeat } = require('../controllers/iotController');

router.use(authenticateDevice);

router.post('/data', pushData);
router.get('/config', getConfig);
router.post('/heartbeat', heartbeat);

module.exports = router;
