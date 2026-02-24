const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  loginAdmin,
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllBookings,
  getAllBills,
  createStation,
  updateStation,
  deleteStation,
} = require('../controllers/adminController');

router.post('/login', loginAdmin);

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/bookings', getAllBookings);
router.get('/bills', getAllBills);
router.post('/stations', createStation);
router.put('/stations/:id', updateStation);
router.delete('/stations/:id', deleteStation);

module.exports = router;
