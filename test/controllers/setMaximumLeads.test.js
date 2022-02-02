const request = require('supertest');
const express = require('express');
const routes = require('../../src/routes');
const { setHeaders } = require('../utils/helpers');

jest.mock('leadrouting-common/requests/getUser');
jest.mock('leadrouting-common/requests/getOrgsByAgentId');
jest.mock('leadrouting-common/requests/getAgentsByOrgId');
jest.mock('leadrouting-common/requests/getSources');
jest.mock('leadrouting-common/requests/getAem');

describe('POST /teams/:teamId/agents/:agentId/maximum-leads', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';

  test('Should return 409 - non-rainmaker', async () => {
    const payload = { maximum_leads: 0 };
    const headers = setHeaders({}, 1);
    await request(app)
      .post(`${baseURL}/teams/534687/agents/556396/maximum-leads`)
      .send(payload)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(409);
  });

  test('Should return 400 if payload is not valid', async () => {
    const payload = { maximum_leads: 'string' };
    const headers = setHeaders({}, 624457);
    await request(app)
      .post(`${baseURL}/teams/534687/agents/624457/maximum-leads`)
      .send(payload)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  test('Should create or find agent setting record if payload valid', async () => {
    const payload = { maximum_leads: 123 };
    const headers = setHeaders({}, 624457);
    const { body } = await request(app)
      .post(`${baseURL}/teams/534687/agents/556396/maximum-leads`)
      .send(payload)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(body.maximum_leads).toBe(payload.maximum_leads);
  });
});
