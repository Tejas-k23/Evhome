require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');



const app = express();
const path = require('path');
const fs = require('fs');

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const distPath = path.join(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/owner', require('./routes/ownerRoutes'));
app.use('/api/stations', require('./routes/stationRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/iot', require('./routes/iotRoutes'));

// Serve static files from the React app if it exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log(`Serving static files from: ${distPath}`);
} else {
  console.warn(`Warning: Static files directory not found at ${distPath}. Server will only act as an API.`);
}

app.get('/api', (req, res) => {
  res.json({ message: 'EV Home API is running' });
});

// Root path fallback
app.get('/', (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({
      message: 'EV Home API is running',
      frontend: 'Frontend build not found. If this is the backend-only deployment, use the frontend URL.',
      status: 'Ready'
    });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file if it exists.
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({
        message: 'Not Found',
        details: 'Frontend build not found and this is not a valid API route.'
      });
    }
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
