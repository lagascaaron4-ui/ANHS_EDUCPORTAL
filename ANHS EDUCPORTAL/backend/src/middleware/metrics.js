const metricsStore = {
  startedAt: Date.now(),
  requestCount: 0,
  byMethod: {},
  byStatus: {},
  byPath: {},
  totalResponseTimeMs: 0
};

function normalizePath(pathname) {
  return String(pathname || '/')
    .replace(/\/[0-9a-fA-F]{24}(?=\/|$)/g, '/:id')
    .replace(/\/\d+(?=\/|$)/g, '/:id');
}

function collectMetrics(req, res, next) {
  const started = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - started;
    const method = String(req.method || 'GET').toUpperCase();
    const status = String(res.statusCode || 0);
    const path = normalizePath(req.path || req.originalUrl || '/');

    metricsStore.requestCount += 1;
    metricsStore.totalResponseTimeMs += duration;
    metricsStore.byMethod[method] = (metricsStore.byMethod[method] || 0) + 1;
    metricsStore.byStatus[status] = (metricsStore.byStatus[status] || 0) + 1;
    metricsStore.byPath[path] = (metricsStore.byPath[path] || 0) + 1;
  });

  next();
}

function getMetricsSnapshot() {
  const avgResponseTimeMs = metricsStore.requestCount > 0
    ? Number((metricsStore.totalResponseTimeMs / metricsStore.requestCount).toFixed(2))
    : 0;

  return {
    startedAt: new Date(metricsStore.startedAt).toISOString(),
    uptimeSeconds: Math.floor((Date.now() - metricsStore.startedAt) / 1000),
    requestCount: metricsStore.requestCount,
    avgResponseTimeMs,
    byMethod: metricsStore.byMethod,
    byStatus: metricsStore.byStatus,
    byPath: metricsStore.byPath
  };
}

module.exports = { collectMetrics, getMetricsSnapshot };
