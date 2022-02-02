const request = require('supertest');
const express = require('express');
const routes = require('../../src/routes');
const { setHeaders } = require('../utils/helpers');

jest.mock('leadrouting-common/requests/getUser');
jest.mock('leadrouting-common/requests/getOrgsByAgentId');
jest.mock('leadrouting-common/requests/getAem');

describe('GET /teams/:teamId/agents/:agentId/agent-settings', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';

  test('Should return 409 error - if team ID does not have members', async () => {
    const headers = setHeaders({}, 624457);
    await request(app)
      .get(`${baseURL}/teams/123/agents/556396/agent-settings`)
      .set(headers)
      .expect(409);
  });

  test('Should return 409 error - if non-rainmaker', async () => {
    const headers = setHeaders({}, 1);
    await request(app)
      .get(`${baseURL}/teams/534687/agents/556397/agent-settings`)
      .set(headers)
      .set('Authorization', 'associate')
      .expect(409);
  });

  test('Should return 200', async () => {
    const payload = {
      is_mobile: true,
      is_email: true,
      is_command: true,
      email: 'dev@gmail.com',
      maximum_leads: 123,
    };
    const teamId = 534687;
    const agentId = 556396;
    const headers = setHeaders({}, 624457);

    await request(app)
      .post(`${baseURL}/teams/${teamId}/agents/${agentId}/agent-settings`)
      .send(payload)
      .set(headers)
      .expect(200);

    const { body } = await request(app)
      .get(`${baseURL}/teams/534687/agents/556396/agent-settings`)
      .set(headers)
      .expect(200);

    expect(body.agent_kwuid).toBe(agentId);
    expect(body.maximum_leads).toBe(0);
    expect(body.email).toBe(payload.email);
    expect(body.is_command).toBe(payload.is_command);
    expect(body.is_email).toBe(payload.is_email);
    expect(body.is_mobile).toBe(payload.is_mobile);
    expect(body.team_id).toBe(teamId);
  });
});
