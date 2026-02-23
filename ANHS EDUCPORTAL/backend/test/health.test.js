const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');

function request(port, path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method: 'GET'
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body });
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

test('GET /api/health returns ok payload', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const response = await request(port, '/api/health');
    assert.equal(response.statusCode, 200);

    const payload = JSON.parse(response.body);
    assert.equal(payload.status, 'ok');
    assert.equal(typeof payload.time, 'string');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('unknown route returns 404', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const response = await request(port, '/api/does-not-exist');
    assert.equal(response.statusCode, 404);

    const payload = JSON.parse(response.body);
    assert.equal(payload.message, 'Not found');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
