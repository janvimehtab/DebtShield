/**
 * DebtShield Express Application
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const debtRoutes = require('./routes/debtRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Primary API Router
app.use('/api', debtRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'DebtShield API Server',
    description: 'Multi-Debt Avalanche/Snowball Waterfall & Refinancing Simulator',
    health: '/api/health',
    simulate: 'POST /api/simulate',
    refinance: 'POST /api/refinance'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} not found`
    }
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
