const express = require('express');
const router = express.Router();
const { validateForOtp, verifyMsg91Token, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/validate-for-otp', validateForOtp);
router.post('/verify-msg91-token', verifyMsg91Token);
router.get('/me', protect, getMe);

module.exports = router;
