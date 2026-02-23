const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const CORE_RESOURCES = new Set([
  'users',
  'students',
  'teachers',
  'classes',
  'enrollments',
  'attendance',
  'grades',
  'assignments',
  'schedule',
  'announcements',
  'news',
  'events',
  'admissions',
  'contacts',
  'programs',
  'uploads',
  'parents',
  'parent-links',
  'parent-messages',
  'invites'
]);

function getResourceFromPath(pathname) {
  const parts = String(pathname || '')
    .split('?')[0]
    .split('/')
    .filter(Boolean);

  if (parts[0] !== 'api') return null;
  return parts[1] || null;
}

function auditTrail(req, res, next) {
  const method = String(req.method || '').toUpperCase();
  if (!MUTATION_METHODS.has(method)) {
    return next();
  }

  res.on('finish', () => {
    if (res.statusCode >= 400) return;

    const resource = getResourceFromPath(req.originalUrl || req.url);
    if (!resource || !CORE_RESOURCES.has(resource)) return;

    const actor = req.user
      ? { id: String(req.user._id), role: req.user.role || 'unknown' }
      : { id: null, role: 'anonymous' };

    const payload = {
      type: 'audit',
      time: new Date().toISOString(),
      requestId: req.requestId,
      method,
      resource,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      actor,
      targetId: req.params?.id || null
    };

    console.info(JSON.stringify(payload));
  });

  next();
}

module.exports = { auditTrail };
