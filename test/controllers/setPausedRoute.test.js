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

describe('POST /teams/:teamId/agents/:agentId/pause/routes', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';
  const teamId = 35004;
  const agentId = 556396;

  test('Should return 400 if time is not valid', async () => {
    const route = await createRoute(app);
    const body = { time: -123, route_id: route.id };
    const headers = setHeaders({}, 624457);
    await request(app)
      .post(`${baseURL}/teams/${teamId}/agents/${agentId}/pause/routes`)
      .send(body)
      .set(headers)
      .expect(400);
  });

  test('Should return 400 if route_id is not provided', async () => {
    const body = { time: 123 };
    const headers = setHeaders({}, 624457);
    await request(app)
      .post(`${baseURL}/teams/${teamId}/agents/${agentId}/pause/routes`)
      .send(body)
      .set(headers)
      .expect(400);
  });

  test('Should return 400 if time is not valid', async () => {
    const route = await createRoute(app);
    const payload = { time: 123, route_id: route.id };
    const headers = setHeaders({}, 624457);
    const { body } = await request(app)
      .post(`${baseURL}/teams/${teamId}/agents/${agentId}/pause/routes`)
      .send(payload)
      .set(headers)
      .expect(200);

    expect(body.data).toMatchObject({
      id: `${agentId}`,
      type: 'paused-agent-routes',
      attributes: {
        pause_until_ts: payload.time,
        route_id: payload.route_id,
      },
    });
  });
});
