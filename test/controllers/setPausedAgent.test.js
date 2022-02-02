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
  const teamId = 35004;
  const agentId = 556396;

  test('Should return 400 if body is not valid', async () => {
    const body = { time: -123 };
    const headers = setHeaders({}, 624457);
    await request(app)
      .post(`${baseURL}/teams/${teamId}/agents/${agentId}/pause`)
      .send(body)
      .set(headers)
      .expect(400);
  });

  test('Should return 400 if userId is not valid', async () => {
    const body = { time: 123 };
    const headers = setHeaders({}, 624457);
    await request(app)
      .post(`${baseURL}/teams/${teamId}/agents/null/pause`)
      .send(body)
      .set(headers)
      .expect(400);
  });

  test('Should return 200 if body is valid', async () => {
    const payload = { time: 123 };
    const headers = setHeaders({}, 624457);
    const { body } = await request(app)
      .post(`${baseURL}/teams/${teamId}/agents/${agentId}/pause`)
      .send(payload)
      .set(headers)
      .expect(200);

    expect(body.data).toMatchObject({
      id: `${agentId}`,
      type: 'paused-agents',
      attributes: {
        pause_until_ts: payload.time,
      },
    });
  });

  test('Should return 200 if body is valid', async () => {
    const headers = setHeaders({}, 624457);
    const { body } = await request(app)
      .post(`${baseURL}/teams/${teamId}/agents/${agentId}/pause`)
      .send()
      .set(headers)
      .expect(200);

    expect(body.data).toMatchObject({
      id: `${agentId}`,
      type: 'paused-agents',
      attributes: {
        pause_until_ts: null,
      },
    });
  });
});
