const mongoose = require('mongoose');

const socketSchema = new mongoose.Schema(
  {
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
    },
    socketNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'],
      default: 'AVAILABLE',
    },
  },
  { timestamps: true }
);

socketSchema.index({ station: 1, socketNumber: 1 }, { unique: true });

module.exports = mongoose.model('Socket', socketSchema);
