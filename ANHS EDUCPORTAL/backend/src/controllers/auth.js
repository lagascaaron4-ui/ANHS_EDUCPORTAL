const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Invite = require('../models/Invite');
const Parent = require('../models/Parent');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { parseCookies } = require('../utils/cookies');

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function authCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

function setAuthCookie(res, token) {
  res.cookie('anhs_token', token, authCookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie('anhs_token', {
    ...authCookieOptions(),
    maxAge: undefined
  });
}

function csrfCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

function issueCsrfToken(res) {
  const token = crypto.randomBytes(24).toString('hex');
  res.cookie('anhs_csrf', token, csrfCookieOptions());
  return token;
}

function ensureCsrfToken(req, res) {
  const cookies = parseCookies(req.headers.cookie || '');
  const existing = cookies.anhs_csrf;
  if (existing) return existing;
  return issueCsrfToken(res);
}

function clearCsrfCookie(res) {
  res.clearCookie('anhs_csrf', {
    ...csrfCookieOptions(),
    maxAge: undefined
  });
}

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    preferences: user.preferences || {}
  };
}

function sanitizePreferences(input = {}) {
  const raw = (input && typeof input === 'object') ? input : {};
  return {
    darkMode: !!raw.darkMode,
    highContrast: !!raw.highContrast,
    rememberUser: !!raw.rememberUser,
    rememberedEmail: raw.rememberUser ? String(raw.rememberedEmail || '').trim() : '',
    rememberedRole: raw.rememberUser ? String(raw.rememberedRole || '').trim() : ''
  };
}

function buildTeacherId(rawStaffId, userId) {
  const staffId = String(rawStaffId || '').trim();
  if (staffId) return staffId;
  const userToken = String(userId || '').slice(-8).toUpperCase() || Date.now().toString().slice(-8);
  return `TCH-${userToken}`;
}

async function register(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      role,
      inviteToken,
      firstName,
      lastName,
      studentId,
      gradeLevel,
      birthDate,
      contactInfo,
      address,
      guardianName,
      guardianContact,
      staffId,
      department,
      subjects,
      gradeLevels
    } = req.body;

    const normalizedEmail = (email || '').toLowerCase().trim();
    const requestedRole = role || 'student';

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }

    if (!['admin', 'teacher', 'student', 'staff', 'parent'].includes(requestedRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (requestedRole === 'student' && (!studentId || !gradeLevel)) {
      return res.status(400).json({ message: 'studentId and gradeLevel are required for students' });
    }

    if (['admin', 'teacher', 'staff'].includes(requestedRole)) {
      if (!inviteToken) {
        return res.status(403).json({ message: 'Invite token required' });
      }

      const invite = await Invite.findOne({ token: inviteToken, usedAt: null });
      if (!invite) return res.status(403).json({ message: 'Invalid or used invite token' });
      if (invite.expiresAt < new Date()) return res.status(403).json({ message: 'Invite token expired' });
      if (invite.email !== normalizedEmail) return res.status(403).json({ message: 'Invite email mismatch' });
      if (invite.role !== requestedRole) return res.status(403).json({ message: 'Invite role mismatch' });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: 'Email already used' });

    const parsedFirst = firstName || (name ? name.split(' ')[0] : '');
    const parsedLast = lastName || (name ? name.split(' ').slice(1).join(' ') : '');
    const normalizedStaffId = (staffId || '').trim();
    const normalizedDepartment = (department || '').trim();

    const createProfiles = async (user, session = null) => {
      const options = session ? { session } : undefined;

      if (requestedRole === 'student') {
        const studentDoc = {
          user: user._id,
          studentId,
          firstName: parsedFirst || 'Student',
          lastName: parsedLast || 'User',
          gradeLevel,
          birthDate: birthDate ? new Date(birthDate) : undefined,
          contactInfo: contactInfo || normalizedEmail,
          address,
          guardianName,
          guardianContact
        };
        if (session) await Student.create([studentDoc], options);
        else await Student.create(studentDoc);
      }

      if (requestedRole === 'teacher') {
        const teacherDoc = {
          user: user._id,
          teacherId: buildTeacherId(normalizedStaffId, user._id),
          firstName: parsedFirst || 'Teacher',
          lastName: parsedLast || 'User',
          department: normalizedDepartment || undefined,
          subjects: Array.isArray(subjects) ? subjects : [],
          gradeLevels: Array.isArray(gradeLevels) ? gradeLevels : [],
          contactInfo: contactInfo || normalizedEmail
        };
        if (session) await Teacher.create([teacherDoc], options);
        else await Teacher.create(teacherDoc);
      }

      if (requestedRole === 'parent') {
        const parentDoc = {
          user: user._id,
          firstName: parsedFirst || 'Parent',
          lastName: parsedLast || 'User',
          contactInfo: contactInfo || normalizedEmail
        };
        if (session) await Parent.create([parentDoc], options);
        else await Parent.create(parentDoc);
      }

      if (['admin', 'teacher', 'staff'].includes(requestedRole)) {
        await Invite.updateOne({ token: inviteToken }, { $set: { usedAt: new Date() } }, options);
      }
    };

    let user = null;
    const session = await User.startSession();
    try {
      await session.withTransaction(async () => {
        user = (await User.create([{ name, email: normalizedEmail, password, role: requestedRole }], { session }))[0];
        await createProfiles(user, session);
      });
    } catch (txErr) {
      const txUnsupported = /Transaction numbers are only allowed on a replica set member or mongos/i.test(txErr.message || '');
      if (!txUnsupported) throw txErr;

      // Fallback for local non-replica-set MongoDB: manual cleanup on failure.
      let fallbackUser = null;
      try {
        fallbackUser = await User.create({ name, email: normalizedEmail, password, role: requestedRole });
        await createProfiles(fallbackUser);
        user = fallbackUser;
      } catch (fallbackErr) {
        if (fallbackUser?._id) {
          await Promise.all([
            Student.deleteOne({ user: fallbackUser._id }),
            Parent.deleteOne({ user: fallbackUser._id }),
            Teacher.deleteOne({ user: fallbackUser._id }),
            User.deleteOne({ _id: fallbackUser._id })
          ]);
        }
        throw fallbackErr;
      }
    } finally {
      session.endSession();
    }

    const token = signToken(user);
    setAuthCookie(res, token);
    const csrfToken = issueCsrfToken(res);
    res.status(201).json({
      user: toPublicUser(user),
      token,
      csrfToken
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    if (role && user.role !== role) {
      return res.status(403).json({ message: `Role mismatch: account is registered as ${user.role}` });
    }

    const token = signToken(user);
    setAuthCookie(res, token);
    const csrfToken = issueCsrfToken(res);
    res.json({
      user: toPublicUser(user),
      token,
      csrfToken
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  const csrfToken = ensureCsrfToken(req, res);
  res.json({ user: toPublicUser(req.user), csrfToken });
}

async function csrf(req, res) {
  const csrfToken = ensureCsrfToken(req, res);
  res.json({ csrfToken });
}

async function getPreferences(req, res) {
  const preferences = req.user?.preferences || {};
  res.json({ preferences });
}

async function updatePreferences(req, res, next) {
  try {
    const preferences = sanitizePreferences(req.body?.preferences || req.body || {});
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { preferences } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ preferences: updated.preferences || {} });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  clearAuthCookie(res);
  clearCsrfCookie(res);
  res.status(204).send();
}

module.exports = { register, login, me, csrf, getPreferences, updatePreferences, logout };
