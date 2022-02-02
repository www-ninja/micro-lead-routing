const request = require('supertest');
const express = require('express');
const routes = require('../../src/routes');
const createRoute = require('./utilitiy/createRoute');
const { setHeaders } = require('../utils/helpers');

jest.mock('leadrouting-common/requests/getUser');
jest.mock('leadrouting-common/requests/getOrgsByAgentId');
jest.mock('leadrouting-common/requests/getAgentsByOrgId');
jest.mock('leadrouting-common/requests/getSources');
jest.mock('leadrouting-common/requests/getAem');

describe('GET /teams/:teamId/agents/:agentId/pause/routes', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';
  const teamId = 534687;
  const agentId = 556396;

  test('Should return empty array if paused route does not exist', async () => {
    const route = await createRoute(app);
    const payload = { time: 123, route_id: route.id };
    const headers = setHeaders({}, agentId);
    await request(app)
      .post(`${baseURL}/teams/${teamId}/agents/${agentId}/pause/routes`)
      .send(payload)
      .set(headers);

    const { body } = await request(app)
      .get(`${baseURL}/teams/${teamId}/agents/${agentId}/pause/routes`)
      .set(headers)
      .expect(200);

    expect(body.data.length).toBe(0);
  });

  test('Should return paused routes', async () => {
    const route = await createRoute(app);
    const payload = { time: null, route_id: route.id };
    const headers = setHeaders({}, agentId);

    await request(app)
      .post(`${baseURL}/teams/${teamId}/agents/${agentId}/pause/routes`)
      .send(payload)
      .set(headers);

    const { body } = await request(app)
      .get(`${baseURL}/teams/${teamId}/agents/${agentId}/pause/routes`)
      .set(headers)
      .expect(200);

    expect(body.data.length).toBe(1);
    expect(body.data[0]).toMatchObject({
      attributes: { pause_until_ts: payload.time, route_id: route.id }, id: `${agentId}`, type: 'paused-agent-routes',
    });
  });
});
