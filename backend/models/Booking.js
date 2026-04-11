const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
    },
    socket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Socket',
      default: null,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    durationMinutes: {
      type: Number,
    },
    userStartedAt: {
      type: Date,
      default: null,
    },
    ownerStartedAt: {
      type: Date,
      default: null,
    },
    sessionInitiatedAt: {
      type: Date,
      default: null,
    },
    sessionInitiatedBy: {
      type: String,
      enum: ['user', 'owner'],
      default: null,
    },
    status: {
      type: String,
      enum: ['BOOKED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'BOOKED',
    },
    energyKwh: {
      type: Number,
      default: 0,
    },
    cost: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

bookingSchema.pre('save', function (next) {
  if (this.startTime && this.endTime) {
    this.durationMinutes = Math.round(
      (new Date(this.endTime) - new Date(this.startTime)) / (1000 * 60)
    );
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
