const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');
const Admission = require('../src/models/Admission');
const ContactMessage = require('../src/models/ContactMessage');
const User = require('../src/models/User');
const Teacher = require('../src/models/Teacher');
const Program = require('../src/models/Program');
const Enrollment = require('../src/models/Enrollment');
const Grade = require('../src/models/Grade');
const jwt = require('jsonwebtoken');

function request(port, path, options = {}) {
  const method = options.method || 'GET';
  const headers = { ...(options.headers || {}) };
  let body = null;

  if (options.body && typeof options.body === 'object') {
    body = JSON.stringify(options.body);
    headers['content-type'] = 'application/json';
    headers['content-length'] = Buffer.byteLength(body);
  } else if (typeof options.body === 'string') {
    body = options.body;
    headers['content-length'] = Buffer.byteLength(body);
  }

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          let json = null;
          try {
            json = raw ? JSON.parse(raw) : null;
          } catch (_) {
            json = null;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: raw,
            json
          });
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function withServer(run) {
  const server = app.listen(0);
  const { port } = server.address();
  try {
    return await run(port);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('GET /api/auth/csrf returns token and csrf cookie', async () => {
  await withServer(async (port) => {
    const response = await request(port, '/api/auth/csrf');
    assert.equal(response.statusCode, 200);
    assert.equal(typeof response.json?.csrfToken, 'string');
    assert.ok(response.json.csrfToken.length >= 24);

    const setCookie = response.headers['set-cookie'] || [];
    assert.ok(setCookie.some((cookie) => cookie.startsWith('anhs_csrf=')));
  });
});

test('protected route blocks anonymous access', async () => {
  await withServer(async (port) => {
    const response = await request(port, '/api/announcements');
    assert.equal(response.statusCode, 401);
    assert.equal(response.json?.message, 'Unauthorized');
  });
});

test('GET /api/programs is public for anonymous users', async () => {
  const originalFind = Program.find;
  Program.find = () => ({
    sort: async () => ([])
  });

  try {
    await withServer(async (port) => {
      const response = await request(port, '/api/programs');
      assert.equal(response.statusCode, 200);
      assert.ok(Array.isArray(response.json));
    });
  } finally {
    Program.find = originalFind;
  }
});

test('GET /api/stats/charts is public and groups by score', async () => {
  const originalEnrollmentAggregate = Enrollment.aggregate;
  const originalGradeAggregate = Grade.aggregate;
  let capturedGradePipeline = null;

  Enrollment.aggregate = async () => ([
    { _id: '7', count: 15 },
    { _id: '8', count: 12 }
  ]);
  Grade.aggregate = async (pipeline) => {
    capturedGradePipeline = pipeline;
    return [
      { _id: 85, count: 3 },
      { _id: 92, count: 2 }
    ];
  };

  try {
    await withServer(async (port) => {
      const response = await request(port, '/api/stats/charts');
      assert.equal(response.statusCode, 200);
      assert.equal(response.json?.success, true);
      assert.deepEqual(response.json?.data?.gradeDistribution, [
        { _id: 85, count: 3 },
        { _id: 92, count: 2 }
      ]);
      assert.equal(capturedGradePipeline?.[0]?.$group?._id, '$score');
    });
  } finally {
    Enrollment.aggregate = originalEnrollmentAggregate;
    Grade.aggregate = originalGradeAggregate;
  }
});

test('POST /api/admissions is public and creates record', async () => {
  const originalCreate = Admission.create;
  Admission.create = async (payload) => ({
    _id: 'adm-1',
    ...payload
  });

  const originalInfo = console.info;
  const auditEvents = [];
  console.info = (...args) => {
    auditEvents.push(args.join(' '));
  };

  try {
    await withServer(async (port) => {
      const payload = {
        studentName: 'Juan Dela Cruz',
        gradeLevel: '7',
        guardianName: 'Maria Dela Cruz',
        contactInfo: '09123456789',
        previousSchool: 'Aliaga ES'
      };

      const response = await request(port, '/api/admissions', {
        method: 'POST',
        body: payload
      });

      assert.equal(response.statusCode, 201);
      assert.equal(response.json?.studentName, payload.studentName);
      assert.equal(response.json?.gradeLevel, payload.gradeLevel);
      assert.equal(response.json?.guardianName, payload.guardianName);
      assert.equal(response.json?.contactInfo, payload.contactInfo);
      assert.equal(response.json?.previousSchool, payload.previousSchool);
    });
  } finally {
    Admission.create = originalCreate;
    console.info = originalInfo;
  }

  assert.ok(
    auditEvents.some((line) => line.includes('"type":"audit"') && line.includes('"resource":"admissions"'))
  );
});

test('POST /api/contacts is public and creates record', async () => {
  const originalCreate = ContactMessage.create;
  ContactMessage.create = async (payload) => ({
    _id: 'msg-1',
    ...payload
  });

  try {
    await withServer(async (port) => {
      const payload = {
        name: 'Parent User',
        email: 'parent@example.com',
        subject: 'Enrollment',
        message: 'Need details about requirements'
      };

      const response = await request(port, '/api/contacts', {
        method: 'POST',
        body: payload
      });

      assert.equal(response.statusCode, 201);
      assert.equal(response.json?.name, payload.name);
      assert.equal(response.json?.email, payload.email);
      assert.equal(response.json?.subject, payload.subject);
      assert.equal(response.json?.message, payload.message);
    });
  } finally {
    ContactMessage.create = originalCreate;
  }
});

test('request-id header is propagated when provided by client', async () => {
  await withServer(async (port) => {
    const requestId = 'uat-request-id-001';
    const response = await request(port, '/api/health', {
      headers: {
        'x-request-id': requestId
      }
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['x-request-id'], requestId);
  });
});

test('student token is forbidden on admin-only users route', async () => {
  const originalJwtVerify = jwt.verify;
  const originalFindById = User.findById;

  jwt.verify = () => ({ sub: 'user-student-1', role: 'student' });
  User.findById = () => ({
    select: async () => ({
      _id: 'user-student-1',
      role: 'student',
      email: 'student@anhs.edu'
    })
  });

  try {
    await withServer(async (port) => {
      const response = await request(port, '/api/users', {
        headers: {
          authorization: 'Bearer fake-token'
        }
      });
      assert.equal(response.statusCode, 403);
      assert.equal(response.json?.message, 'Forbidden');
    });
  } finally {
    jwt.verify = originalJwtVerify;
    User.findById = originalFindById;
  }
});

test('admin token can access users list route', async () => {
  const originalJwtVerify = jwt.verify;
  const originalFindById = User.findById;
  const originalFind = User.find;

  jwt.verify = () => ({ sub: 'user-admin-1', role: 'admin' });
  User.findById = () => ({
    select: async () => ({
      _id: 'user-admin-1',
      role: 'admin',
      email: 'admin@anhs.edu'
    })
  });
  User.find = () => ({
    sort: async () => ([])
  });

  try {
    await withServer(async (port) => {
      const response = await request(port, '/api/users', {
        headers: {
          authorization: 'Bearer fake-token'
        }
      });
      assert.equal(response.statusCode, 200);
      assert.ok(Array.isArray(response.json));
    });
  } finally {
    jwt.verify = originalJwtVerify;
    User.findById = originalFindById;
    User.find = originalFind;
  }
});

test('teacher token is forbidden on staff/admin-only teachers route', async () => {
  const originalJwtVerify = jwt.verify;
  const originalFindById = User.findById;

  jwt.verify = () => ({ sub: 'user-teacher-1', role: 'teacher' });
  User.findById = () => ({
    select: async () => ({
      _id: 'user-teacher-1',
      role: 'teacher',
      email: 'teacher@anhs.edu'
    })
  });

  try {
    await withServer(async (port) => {
      const response = await request(port, '/api/teachers', {
        headers: {
          authorization: 'Bearer fake-token'
        }
      });
      assert.equal(response.statusCode, 403);
      assert.equal(response.json?.message, 'Forbidden');
    });
  } finally {
    jwt.verify = originalJwtVerify;
    User.findById = originalFindById;
  }
});

test('staff token can access teachers list route', async () => {
  const originalJwtVerify = jwt.verify;
  const originalFindById = User.findById;
  const originalFind = Teacher.find;

  jwt.verify = () => ({ sub: 'user-staff-1', role: 'staff' });
  User.findById = () => ({
    select: async () => ({
      _id: 'user-staff-1',
      role: 'staff',
      email: 'staff@anhs.edu'
    })
  });
  Teacher.find = () => ({
    sort: async () => ([])
  });

  try {
    await withServer(async (port) => {
      const response = await request(port, '/api/teachers', {
        headers: {
          authorization: 'Bearer fake-token'
        }
      });
      assert.equal(response.statusCode, 200);
      assert.ok(Array.isArray(response.json));
    });
  } finally {
    jwt.verify = originalJwtVerify;
    User.findById = originalFindById;
    Teacher.find = originalFind;
  }
});

test('invalid admissions payload is rejected by request validation', async () => {
  await withServer(async (port) => {
    const response = await request(port, '/api/admissions', {
      method: 'POST',
      body: {
        gradeLevel: '7'
      }
    });

    assert.equal(response.statusCode, 400);
    assert.equal(response.json?.message, 'Invalid request body');
    assert.ok(Array.isArray(response.json?.issues));
    assert.ok(response.json.issues.length > 0);
  });
});

test('ops metrics endpoint requires authentication', async () => {
  await withServer(async (port) => {
    const response = await request(port, '/api/ops/metrics');
    assert.equal(response.statusCode, 401);
    assert.equal(response.json?.message, 'Unauthorized');
  });
});

test('admin can access ops metrics snapshot', async () => {
  const originalJwtVerify = jwt.verify;
  const originalFindById = User.findById;

  jwt.verify = () => ({ sub: 'user-admin-2', role: 'admin' });
  User.findById = () => ({
    select: async () => ({
      _id: 'user-admin-2',
      role: 'admin',
      email: 'admin2@anhs.edu'
    })
  });

  try {
    await withServer(async (port) => {
      const response = await request(port, '/api/ops/metrics', {
        headers: {
          authorization: 'Bearer fake-token'
        }
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.json?.success, true);
      assert.equal(typeof response.json?.data?.requestCount, 'number');
      assert.equal(typeof response.json?.data?.avgResponseTimeMs, 'number');
    });
  } finally {
    jwt.verify = originalJwtVerify;
    User.findById = originalFindById;
  }
});
