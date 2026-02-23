/**
 * Error Logging & Monitoring System
 * Captures frontend errors and sends them to backend for logging
 */

class ErrorLogger {
  constructor(apiEndpoint = '/api/logs/error') {
    this.apiEndpoint = apiEndpoint;
    this.setupGlobalErrorHandling();
  }

  /**
   * Setup global error handlers
   */
  setupGlobalErrorHandling() {
    // Catch uncaught errors
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'uncaught',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'unhandled-rejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack
      });
    });

    // Catch console errors
    const originalError = console.error;
    console.error = (...args) => {
      this.logError({
        type: 'console-error',
        message: args.join(' ')
      });
      originalError.apply(console, args);
    };
  }

  /**
   * Log error to backend
   */
  async logError(errorData) {
    try {
      const payload = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...errorData
      };

      // Log to console in development
      if (process.env.NODE_ENV !== 'production') {
        console.log('[ErrorLogger]', payload);
      }

      // Send to backend (only in production)
      if (process.env.NODE_ENV === 'production') {
        await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
    } catch (err) {
      console.warn('Failed to log error:', err);
    }
  }

  /**
   * Manual error logging
   */
  log(message, severity = 'error', context = {}) {
    this.logError({
      type: 'manual',
      severity,
      message,
      context
    });
  }
}

/**
 * Performance Monitoring
 */
class PerformanceMonitor {
  /**
   * Measure API response time
   */
  static measureAPICall(endpoint, duration) {
    const perf = {
      timestamp: new Date().toISOString(),
      endpoint,
      duration,
      slow: duration > 3000 // Flag if slower than 3 seconds
    };

    if (perf.slow) {
      console.warn(`[PerformanceWarning] Slow API: ${endpoint} took ${duration}ms`);
    }

    return perf;
  }

  /**
   * Get page load metrics
   */
  static getPageMetrics() {
    const perfData = window.performance.timing;
    return {
      pageLoadTime: perfData.loadEventEnd - perfData.navigationStart,
      domReadyTime: perfData.domContentLoadedEventEnd - perfData.navigationStart,
      firstContentfulPaint: perfData.responseEnd - perfData.navigationStart,
      serverResponseTime: perfData.responseEnd - perfData.requestStart
    };
  }

  /**
   * Monitor long tasks
   */
  static monitorLongTasks() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn(`[LongTask] ${entry.duration}ms`);
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    }
  }
}

/**
 * User Activity Tracking (for audit)
 */
class ActivityTracker {
  constructor() {
    this.activities = [];
    this.setupTracking();
  }

  setupTracking() {
    // Track page navigation
    window.addEventListener('popstate', () => {
      this.trackActivity('navigation', { url: window.location.href });
    });

    // Track user interactions
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
        this.trackActivity('interaction', {
          element: e.target.tagName,
          id: e.target.id,
          text: e.target.textContent
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      this.trackActivity('form-submit', {
        formId: e.target.id,
        formName: e.target.name
      });
    });
  }

  /**
   * Track user activity
   */
  trackActivity(action, details = {}) {
    const activity = {
      timestamp: new Date().toISOString(),
      action,
      url: window.location.href,
      details
    };

    this.activities.push(activity);

    // Keep only last 50 activities in memory
    if (this.activities.length > 50) {
      this.activities.shift();
    }
  }

  /**
   * Get activity log
   */
  getActivities() {
    return this.activities;
  }

  /**
   * Send activity log to server
   */
  async sendActivityLog(endpoint = '/api/logs/activity') {
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: this.activities })
      });
    } catch (err) {
      console.warn('Failed to send activity log:', err);
    }
  }
}

// Initialize globally
window.errorLogger = new ErrorLogger();
window.performanceMonitor = PerformanceMonitor;
window.activityTracker = new ActivityTracker();

module.exports = {
  ErrorLogger,
  PerformanceMonitor,
  ActivityTracker
};
