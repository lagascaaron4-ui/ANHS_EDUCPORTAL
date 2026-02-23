const crypto = require('crypto');

function attachRequestContext(req, res, next) {
  const incomingRequestId = req.headers['x-request-id'];
  const requestId = (typeof incomingRequestId === 'string' && incomingRequestId.trim())
    ? incomingRequestId.trim()
    : crypto.randomUUID();

  req.requestId = requestId;
  req.requestStartMs = Date.now();
  res.setHeader('x-request-id', requestId);

  next();
}

module.exports = { attachRequestContext };

