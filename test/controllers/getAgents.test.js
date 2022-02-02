const request = require('supertest');
const express = require('express');
const routes = require('../../src/routes');
const createRoute = require('../controllers/utilitiy/createRoute');
const { setHeaders } = require('../utils/helpers');

jest.mock('leadrouting-common/requests/getUser');
jest.mock('leadrouting-common/requests/getOrgsByAgentId');
jest.mock('leadrouting-common/requests/getAgentsByOrgId');
jest.mock('leadrouting-common/requests/getSources');
jest.mock('leadrouting-common/requests/getTeamStatistic');
jest.mock('leadrouting-common/requests/getAem');

describe('GET /agents', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';

  test('Should return 409 - you are not a rainmaker', async () => {
    const headers = setHeaders({}, 1);
    await request(app)
      .get(`${baseURL}/teams/534687/agents`)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(409);
  });

  test('should return valid data if team_id is provided', async () => {
    const headers = setHeaders({}, 624457);
    const { body } = await request(app)
      .get(`${baseURL}/teams/534687/agents`)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(body.data.length).not.toBe(0);
    expect(body.included.length).not.toBe(0);
    expect(body.meta.total).toBe(13);
  });

  test('should return valid data if include=routes are provided', async () => {
    const agentId = 556396;
    const route = await createRoute(app, { agents: [{ id: agentId, weight: 0 }] });
    const headers = setHeaders({}, 624457);

    const { body } = await request(app)
      .get(`${baseURL}/teams/534687/agents?include=routes`)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(200);

    const agentData = body.data.find((element) => element.attributes.id === agentId);
    expect(body.meta.total).toBe(13);
    expect(agentData.attributes.routes[0].id).toBe(route.id);
  });
});
