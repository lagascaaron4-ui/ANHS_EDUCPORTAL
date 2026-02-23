﻿const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const classRoutes = require('./routes/classes');
const enrollmentRoutes = require('./routes/enrollments');
const attendanceRoutes = require('./routes/attendance');
const gradeRoutes = require('./routes/grades');
const announcementRoutes = require('./routes/announcements');
const newsRoutes = require('./routes/news');
const eventRoutes = require('./routes/events');
const admissionRoutes = require('./routes/admissions');
const contactRoutes = require('./routes/contacts');
const programRoutes = require('./routes/programs');
const uploadRoutes = require('./routes/uploads');
const inviteRoutes = require('./routes/invites');
const parentRoutes = require('./routes/parents');
const parentLinkRoutes = require('./routes/parent-links');
const parentMessageRoutes = require('./routes/parent-messages');
const assignmentRoutes = require('./routes/assignments');
const scheduleRoutes = require('./routes/schedule');
const statsRoutes = require('./routes/stats');
const opsRoutes = require('./routes/ops');
const { attachRequestContext } = require('./middleware/request-context');
const { auditTrail } = require('./middleware/audit');
const { collectMetrics } = require('./middleware/metrics');
const { csrfProtection } = require('./middleware/csrf');
const { validateRequestBody } = require('./middleware/request-validation');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

const isProduction = process.env.NODE_ENV === 'production';
const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowAnyOrigin = configuredOrigins.includes('*');
const localDevOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

app.disable('x-powered-by');
app.use(helmet());
app.use(attachRequestContext);
app.use(collectMetrics);
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (!isProduction && localDevOriginPattern.test(origin)) return callback(null, true);
    if (!isProduction && configuredOrigins.length === 0) return callback(null, true);
    if (allowAnyOrigin || configuredOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin denied'));
  },
  credentials: !allowAnyOrigin
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.PUBLIC_UPLOADS === 'true') {
  app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'uploads'));
}
morgan.token('request-id', (req) => req.requestId || '-');
morgan.token('response-time-ms', (req, res) => {
  if (!req.requestStartMs) return '-';
  return Date.now() - req.requestStartMs;
});
const logFormat = isProduction
  ? '{"time":":date[iso]","requestId":":request-id","method":":method","url":":url","status":":status","contentLength":":res[content-length]","responseTimeMs":":response-time-ms"}'
  : ':method :url :status - :response-time ms - reqId=:request-id';
app.use(morgan(logFormat));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300
});
app.use('/api', limiter);
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many authentication attempts, please try again later.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api', csrfProtection);
app.use('/api', validateRequestBody);
app.use('/api', auditTrail);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/parent-links', parentLinkRoutes);
app.use('/api/parent-messages', parentMessageRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ops', opsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
