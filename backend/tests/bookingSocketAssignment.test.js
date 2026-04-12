const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app } = require('../app');
const User = require('../models/User');
const Station = require('../models/Station');
const Socket = require('../models/Socket');

const createUserAndToken = async () => {
  const user = await User.create({
    vehicleNumber: `EV${Date.now()}`,
    mobileNumber: '9999999999',
    name: 'Test User',
  });
  const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET);
  return { user, token };
};

const createStation = async (overrides = {}) => {
  return Station.create({
    name: 'Test Station',
    location: 'Test City',
    lat: 12.34,
    lng: 56.78,
    socketCount: 2,
    pricePerKwh: 12,
    status: 'ACTIVE',
    ...overrides,
  });
};

describe('Booking socket assignment', () => {
  test('auto-assigns a socket when creating a booking', async () => {
    const { token } = await createUserAndToken();
    const station = await createStation();

    const startTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ stationId: station._id.toString(), startTime, endTime });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.socket).toBeTruthy();
    expect(res.body.booking.socket._id).toBeTruthy();
  });

  test('rejects overlapping booking for the same socket', async () => {
    const { token } = await createUserAndToken();
    const station = await createStation({ socketCount: 1 });
    const socket = await Socket.create({ station: station._id, socketNumber: 1, status: 'AVAILABLE' });

    const startTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    const first = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ stationId: station._id.toString(), socketId: socket._id.toString(), startTime, endTime });

    expect(first.status).toBe(201);

    const overlap = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ stationId: station._id.toString(), socketId: socket._id.toString(), startTime, endTime });

    expect(overlap.status).toBe(409);
    expect(overlap.body.success).toBe(false);
  });

  test('auto-assign skips booked sockets when overlap exists', async () => {
    const { token } = await createUserAndToken();
    const station = await createStation({ socketCount: 2 });
    const sockets = await Socket.insertMany([
      { station: station._id, socketNumber: 1, status: 'AVAILABLE' },
      { station: station._id, socketNumber: 2, status: 'AVAILABLE' },
    ]);

    const startTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    const first = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ stationId: station._id.toString(), socketId: sockets[0]._id.toString(), startTime, endTime });

    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ stationId: station._id.toString(), startTime, endTime });

    expect(second.status).toBe(201);
    expect(second.body.booking.socket._id.toString()).toBe(sockets[1]._id.toString());
  });
});
