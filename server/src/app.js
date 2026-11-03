const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const configRoutes = require('./routes/configRoutes');
const progressRoutes = require('./routes/progressRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const contactRoutes = require('./routes/contactRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

// Security headers
app.use(helmet());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// CORS restriction strictly for CLIENT_URL
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: clientUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    time: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/config', configRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Error and 404 Handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
