/**
 * 404 Not Found Middleware
 */
function notFound(req, res, _next) {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = notFound;
