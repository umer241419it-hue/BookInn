/**
 * Central error-handling middleware.
 *
 * Express recognises a middleware with 4 params as an error handler.
 * Any time you call next(error) in a controller, Express skips to here.
 */
const errorHandler = (err, req, res, next) => {
  // Mongoose validation errors come with err.name === 'ValidationError'
  // Mongoose cast errors (bad ObjectId) come with err.name === 'CastError'
  // For now, a simple handler — you can refine this later.

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
    // Only show the stack trace in development
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = errorHandler;
