const Bill = require('../models/Bill');

// @desc    Get current user's bills
// @route   GET /api/bills
exports.getUserBills = async (req, res, next) => {
  try {
    const bills = await Bill.find({ user: req.userId })
      .populate({
        path: 'booking',
        select: 'startTime endTime durationMinutes station',
        populate: { path: 'station', select: 'name location' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bills.length, bills });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single bill by ID
// @route   GET /api/bills/:id
exports.getBillById = async (req, res, next) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, user: req.userId })
      .populate({
        path: 'booking',
        select: 'startTime endTime durationMinutes station',
        populate: { path: 'station', select: 'name location pricePerKwh' },
      });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    res.json({ success: true, bill });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark bill as paid
// @route   PUT /api/bills/:id/pay
exports.markBillPaid = async (req, res, next) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, user: req.userId });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    bill.paymentStatus = 'PAID';
    await bill.save();

    res.json({ success: true, bill });
  } catch (error) {
    next(error);
  }
};
