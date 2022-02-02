const request = require('supertest');
const express = require('express');
const routes = require('../../../src/routes');

describe('getFeatureFlagByTeam controller test', () => {
  const app = express();
  const baseURL = '/api/v1';
  app.use(express.json());
  routes(app);

  const headers = {
    'x-api-key': 'test123',
    'x-api-feature-flag': '1',
  };

  test('request without middleware should return 401', async () => {
    await request(app)
      .get(`${baseURL}/feature-flags/123`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });

  test('GET /feature-flags/:teamId should return 200', async () => {
    await request(app)
      .get(`${baseURL}/feature-flags/123`)
      .set(headers)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
  });
});
