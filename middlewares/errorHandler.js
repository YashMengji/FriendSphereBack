async function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // statusCode should not be 200 at all
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack // Don't send error stack if application is in production
  })
}

module.exports = errorHandler;