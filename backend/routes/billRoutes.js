const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUserBills, getBillById, markBillPaid } = require('../controllers/billController');

router.use(protect);

router.get('/', getUserBills);
router.get('/:id', getBillById);
router.put('/:id/pay', markBillPaid);

module.exports = router;
