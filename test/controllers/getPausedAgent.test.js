const request = require('supertest');
const express = require('express');
const routes = require('../../src/routes');
const { setHeaders } = require('../utils/helpers');

jest.mock('leadrouting-common/requests/getUser');
jest.mock('leadrouting-common/requests/getAem');

describe('POST /teams/:teamId/agents/:agentId/pause', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';
  const teamId = 534687;
  const agentId = 556396;

  test('Should return null if there is no paused agent', async () => {
    const payload = { time: 123 };
    const headers = setHeaders({}, agentId);
    await request(app)
      .post(`${baseURL}/teams/${teamId}/agents/${agentId}/pause`)
      .send(payload)
      .set(headers);

    const { body } = await request(app)
      .get(`${baseURL}/teams/${teamId}/agents/${agentId}/pause`)
      .set(headers)
      .expect(200);

    expect(body.data).toBe(null);
  });

  test('Should return paused agents if time is null', async () => {
    const payload = { time: null };
    const headers = setHeaders({}, agentId);
    await request(app)
      .post(`${baseURL}/teams/${teamId}/agents/${agentId}/pause`)
      .send(payload)
      .set(headers);

    const { body } = await request(app)
      .get(`${baseURL}/teams/${teamId}/agents/${agentId}/pause`)
      .set(headers)
      .expect(200);

    expect(body.data).toMatchObject({ attributes: { pause_until_ts: payload.time }, id: `${agentId}`, type: 'paused-agents' });
  });

  test('Should return 400 if userId is not valid', async () => {
    const headers = setHeaders({}, agentId);
    await request(app)
      .get(`${baseURL}/teams/${teamId}/agents/null/pause`)
      .set(headers)
      .expect(400);
  });
});
