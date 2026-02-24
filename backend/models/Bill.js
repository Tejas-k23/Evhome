const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    unitsKwh: {
      type: Number,
      required: [true, 'Units (kWh) is required'],
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'UNPAID'],
      default: 'UNPAID',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bill', billSchema);
