require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Owner = require('../models/Owner');
const Admin = require('../models/Admin');
const Station = require('../models/Station');
const Socket = require('../models/Socket');
const Booking = require('../models/Booking');
const Bill = require('../models/Bill');
const Session = require('../models/Session');

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear all collections
    await Promise.all([
      User.deleteMany(),
      Owner.deleteMany(),
      Admin.deleteMany(),
      Station.deleteMany(),
      Socket.deleteMany(),
      Booking.deleteMany(),
      Bill.deleteMany(),
      Session.deleteMany(),
    ]);

    console.log('Cleared all collections');

    // Create Admin
    const admin = await Admin.create({
      email: 'admin@evhome.com',
      password: 'Admin@123',
      role: 'superadmin',
    });
    console.log('Admin created: admin@evhome.com / Admin@123');

    // Create Owner
    const owner = await Owner.create({
      name: 'John Doe',
      email: 'owner@evhome.com',
      mobileNumber: '9876543210',
      password: 'Owner@123',
    });
    console.log('Owner created: owner@evhome.com / Owner@123');

    // Create Demo User
    const user = await User.create({
      vehicleNumber: 'MH 12 TK 0210',
      mobileNumber: '9876543211',
      name: 'Demo User',
    });
    console.log('User created: MH 12 TK 0210 / 9876543211');

    // Create Stations
    const stations = await Station.insertMany([
      {
        name: 'Nexus Hub - Downtown',
        location: '123 Main St, Central Plaza',
        lat: 18.5204,
        lng: 73.8567,
        socketCount: 4,
        pricePerKwh: 12.5,
        status: 'ACTIVE',
        owner: owner._id,
      },
      {
        name: 'Green Charge - North',
        location: '45 Market Rd, North Wing',
        lat: 18.55,
        lng: 73.88,
        socketCount: 2,
        pricePerKwh: 10.0,
        status: 'ACTIVE',
        owner: owner._id,
      },
      {
        name: 'EV Power Station - East',
        location: '78 Tech Park, Hinjewadi',
        lat: 18.5912,
        lng: 73.7389,
        socketCount: 6,
        pricePerKwh: 15.0,
        status: 'ACTIVE',
        owner: owner._id,
      },
    ]);
    console.log(`${stations.length} stations created`);

    // Create Sockets for each station
    const socketDocs = [];
    for (const station of stations) {
      for (let i = 1; i <= station.socketCount; i++) {
        socketDocs.push({
          station: station._id,
          socketNumber: i,
          status: 'AVAILABLE',
        });
      }
    }
    await Socket.insertMany(socketDocs);
    console.log(`${socketDocs.length} sockets created`);

    // Create a sample booking
    const booking = await Booking.create({
      user: user._id,
      station: stations[0]._id,
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
      status: 'COMPLETED',
      energyKwh: 5.5,
      cost: 68.75,
    });

    // Create a sample bill
    await Bill.create({
      user: user._id,
      booking: booking._id,
      amount: 68.75,
      unitsKwh: 5.5,
      paymentStatus: 'PAID',
    });

    console.log('Sample booking and bill created');
    console.log('\n--- Seed Complete ---');
    console.log('Admin Key: EVHOME@123');
    console.log('Test OTP: 123456');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
