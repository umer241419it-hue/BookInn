/**
 * Central error-handling middleware.
 */
const errorHandler = (err, req, res, next) => {
  // Handle Multer upload errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File size exceeds the 5MB limit. Please upload smaller images.",
        message: "File size exceeds the 5MB limit. Please upload smaller images.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: "Maximum 10 images can be uploaded at a time.",
        message: "Maximum 10 images can be uploaded at a time.",
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message,
      message: err.message,
    });
  }

  // Handle custom upload/validation errors
  if (err.message && (err.message.includes("Invalid file type") || err.message.includes("allowed"))) {
    return res.status(400).json({
      success: false,
      error: err.message,
      message: err.message,
    });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    error: err.message || "Server Error",
    message: err.message || "Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = errorHandler;

