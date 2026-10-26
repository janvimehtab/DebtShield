/**
 * Global Error Handler Middleware
 */

function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error('Unhandled Server Error:', err);

  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'An internal server error occurred',
      details: err.details || null,
      code: err.code || 'INTERNAL_SERVER_ERROR'
    },
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;
