function notFound(req, res, next) {
  res.status(404).json({ message: 'Not found', requestId: req.requestId });
}

function errorHandler(err, req, res, next) {
  const isProduction = process.env.NODE_ENV === 'production';
  let status = err.status || 500;
  let message = err.message || 'Server error';

  if (err.name === 'MulterError') {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File too large' : 'Invalid upload request';
  } else if (err.message === 'Unsupported file type') {
    status = 400;
  } else if (err.message === 'CORS origin denied') {
    status = 403;
    message = 'Origin not allowed';
  }

  const logPayload = {
    level: 'error',
    time: new Date().toISOString(),
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl || req.url,
    status,
    message,
    errorName: err.name,
    stack: isProduction ? undefined : err.stack
  };
  console.error(JSON.stringify(logPayload));

  res.status(status).json({
    message,
    requestId: req.requestId
  });
}

module.exports = { notFound, errorHandler };
