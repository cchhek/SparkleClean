const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const pageContentRoutes = require('./routes/pageContent');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS (allow any localhost frontend port)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));


// Express built-in parser (JSON and urlencoded)
// Note: Stripe webhook needs raw body if we verify signatures. But since we use Stripe checkout redirect callback on backend, standard json parser is fine.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/page-content', pageContentRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: err.message || 'An internal server error occurred'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
