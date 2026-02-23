const { parseCookies } = require('../utils/cookies');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_SKIP_PATHS = new Set([
  '/health',
  '/auth/login',
  '/auth/register',
  '/auth/csrf',
  '/auth/logout'
]);

function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has((req.method || '').toUpperCase())) return next();
  if (CSRF_SKIP_PATHS.has(req.path)) return next();

  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) return next();

  const cookies = parseCookies(req.headers.cookie || '');
  const authCookie = cookies.anhs_token;
  if (!authCookie) return next();

  const cookieToken = cookies.anhs_csrf;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  return next();
}

module.exports = { csrfProtection };
