const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      match: [/^\d{10}$/, 'Mobile number must be 10 digits'],
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
