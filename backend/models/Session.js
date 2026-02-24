const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    voltage: {
      type: Number,
      default: 0,
    },
    current: {
      type: Number,
      default: 0,
    },
    power: {
      type: Number,
      default: 0,
    },
    energyKwh: {
      type: Number,
      default: 0,
    },
    frequency: {
      type: Number,
      default: 0,
    },
    powerFactor: {
      type: Number,
      default: 0,
    },
    cost: {
      type: Number,
      default: 0,
    },
    source: {
      type: String,
      enum: ['iot', 'simulated', 'manual'],
      default: 'simulated',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
