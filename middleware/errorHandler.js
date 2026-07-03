const errorHandler = (err, req, res, next) => {
  console.error('❌ Erreur:', err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur';
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;