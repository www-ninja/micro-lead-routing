const request = require('supertest');
const express = require('express');
const routes = require('../../src/routes');
const { setHeaders } = require('../utils/helpers');

jest.mock('leadrouting-common/requests/getUser');
jest.mock('leadrouting-common/requests/getOrgsByAgentId');
jest.mock('leadrouting-common/requests/getAem');
jest.mock('leadrouting-common/requests/getContactsFromLeadpool');

describe('GET /teams/:teamId/leads/pooled', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';

  test('should return count for rainmaker', async () => {
    const headers = setHeaders({}, 624457);
    const response = await request(app)
      .get(`${baseURL}/teams/534687/leads/pooled`)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      count: 10,
    });
  });

  test('should return non-rainmaker issue if teamId does not exist', async () => {
    const headers = setHeaders({}, 624457);
    await request(app)
      .get(`${baseURL}/teams/123/leads/pooled`)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(403);
  });
});
