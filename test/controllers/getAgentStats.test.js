const request = require('supertest');
const express = require('express');
const routes = require('../../src/routes');
const { setHeaders } = require('../utils/helpers');

jest.mock('leadrouting-common/requests/getUser');
jest.mock('leadrouting-common/requests/getAgentsByOrgId');
jest.mock('leadrouting-common/requests/getAgentStatistic');
jest.mock('leadrouting-common/requests/getAem');

describe('GET /teams/:teamId/agents/:agentId', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';

  test('Should return 403 if userId is different from agentId and not rainmaker', async () => {
    const headers = setHeaders({}, 1);
    await request(app)
      .get(`${baseURL}/teams/534687/agents/556398`)
      .set(headers)
      .expect(403);
  });

  test('Should return 403 if standard agent accessing other agent dashboard', async () => {
    const headers = setHeaders({ authorization: 'agent2' }, 556398);
    await request(app)
      .get(`${baseURL}/teams/534687/agents/556397`)
      .set(headers)
      .expect(403);
  });

  test('Should return 200 if the agent is rainmaker', async () => {
    const headers = setHeaders({}, 624457);
    const { body } = await request(app)
      .get(`${baseURL}/teams/534687/agents/624457`)
      .set(headers)
      .expect(200);

    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('type');
    expect(body.data.type).toBe('agent');
  });

  test('Should return 200 if agent accessing their own reporting dasboard', async () => {
    const headers = setHeaders({ authorization: 'agent2' }, 556398);
    const { body } = await request(app)
      .get(`${baseURL}/teams/534687/agents/556398`)
      .set(headers)
      .expect(200);

    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('type');
    expect(body.data.type).toBe('agent');
  });
});
