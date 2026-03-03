require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');



const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/owner', require('./routes/ownerRoutes'));
app.use('/api/stations', require('./routes/stationRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/iot', require('./routes/iotRoutes'));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

app.get('/api', (req, res) => {
  res.json({ message: 'EV Home API is running' });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  } else {
    res.status(404).json({ message: 'API route not found' });
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log('Attempting to connect to MongoDB...');
  await connectDB();
  console.log('Database connection attempt initiated.');
  console.log(`Server running on port ${PORT}`);
});
