const mongoose = require('mongoose');
const crypto = require('crypto');

const wifiNetworkSchema = new mongoose.Schema(
  {
    ssid: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    priority: { type: Number, default: 1, min: 1, max: 3 },
  },
  { _id: false }
);

const stationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    socketCount: {
      type: Number,
      required: [true, 'Socket count is required'],
      min: 1,
    },
    pricePerKwh: {
      type: Number,
      required: [true, 'Price per kWh is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      default: null,
    },
    iotApiKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    wifiNetworks: {
      type: [wifiNetworkSchema],
      validate: [arr => arr.length <= 3, 'Maximum 3 WiFi networks allowed'],
      default: [],
    },
    lastHeartbeatAt: {
      type: Date,
      default: null,
    },
    lastDataAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

stationSchema.methods.generateApiKey = function () {
  this.iotApiKey = crypto.randomBytes(32).toString('hex');
  return this.iotApiKey;
};

module.exports = mongoose.model('Station', stationSchema);
