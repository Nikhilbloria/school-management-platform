const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const createApp = require('../src/app');

test('GET /health/live should return 200', async () => {
  const app = createApp({
    query: async () => ({ rows: [{ '?column?': 1 }] }),
  });

  const response = await request(app).get('/health/live');

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.service, 'school-management-platform');
});

test('GET /health/ready should return 200 when database is available', async () => {
  const app = createApp({
    query: async () => ({ rows: [{ '?column?': 1 }] }),
  });

  const response = await request(app).get('/health/ready');

  assert.equal(response.status, 200);
  assert.equal(response.body.database, 'connected');
});

test('GET /health/ready should return 503 when database is unavailable', async () => {
  const app = createApp({
    query: async () => {
      throw new Error('Database connection failed');
    },
  });

  const response = await request(app).get('/health/ready');

  assert.equal(response.status, 503);
  assert.equal(response.body.database, 'unavailable');
});
