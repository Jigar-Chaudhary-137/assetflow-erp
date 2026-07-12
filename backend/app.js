const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/error');

const app = express();

// Load middlewares
app.use(cors());
app.use(express.json());

// Log requests in development mode
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AssetFlow ERP API is running and healthy',
    timestamp: new Date()
  });
});

// Default 404 Route handler for unknown routes
app.use((req, res, next) => {
  const ApiError = require('./utils/ApiError');
  next(new ApiError(`Route not found: ${req.originalUrl}`, 404));
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
