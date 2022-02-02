const request = require('supertest');
const express = require('express');
const routes = require('../../src/routes');
const { setHeaders } = require('../utils/helpers');

jest.mock('leadrouting-common/requests/getUser');
jest.mock('leadrouting-common/requests/getOrgsByAgentId');
jest.mock('leadrouting-common/requests/getAem');

describe('POST /teams/:teamId/agents/:agentId/agent-settings', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';

  test('Should return 409 - the provided Team ID does not have any members', async () => {
    const payload = {
      is_mobile: true,
      is_email: true,
      is_command: true,
      email: 'dev@gmail.com',
      maximum_leads: 123,
    };
    const headers = setHeaders({}, 624457);
    await request(app)
      .post(`${baseURL}/teams/123/agents/556396/agent-settings`)
      .send(payload)
      .set(headers)
      .expect(409);
  });

  test('Should return 400 - if is_mobile is not valid', async () => {
    const payload = {
      is_mobile: 'string',
    };
    const headers = setHeaders({}, 624457);
    const { body } = await request(app)
      .post(`${baseURL}/teams/534687/agents/556396/agent-settings`)
      .send(payload)
      .set(headers)
      .expect(400);

    expect(body).toMatchObject({ error: 'validation_error', error_description: 'data.is_mobile should be boolean', type: 'routes' });
  });

  test('Should return 400 - if is_email is not valid', async () => {
    const payload = {
      is_email: 'string',
    };
    const headers = setHeaders({}, 624457);
    const { body } = await request(app)
      .post(`${baseURL}/teams/534687/agents/556396/agent-settings`)
      .set(headers)
      .send(payload)
      .expect(400);

    expect(body).toMatchObject({ error: 'validation_error', error_description: 'data.is_email should be boolean', type: 'routes' });
  });

  test('Should return 400 - if is_command is not valid', async () => {
    const payload = {
      is_command: 'string',
    };
    const headers = setHeaders({}, 624457);
    const { body } = await request(app)
      .post(`${baseURL}/teams/534687/agents/556396/agent-settings`)
      .send(payload)
      .set(headers)
      .expect(400);

    expect(body).toMatchObject({ error: 'validation_error', error_description: 'data.is_command should be boolean', type: 'routes' });
  });

  test('Should return 400 - if maximum_leads is not valid', async () => {
    const payload = {
      maximum_leads: -123,
    };
    const headers = setHeaders({}, 624457);
    const { body } = await request(app)
      .post(`${baseURL}/teams/534687/agents/556396/agent-settings`)
      .send(payload)
      .set(headers)
      .expect(400);

    expect(body).toMatchObject({ error: 'validation_error', error_description: 'data.maximum_leads should be >= 0', type: 'routes' });
  });

  test('Should return 200', async () => {
    const payload = {
      is_mobile: true,
      is_email: true,
      is_command: true,
      email: 'dev@gmail.com',
      maximum_leads: 123,
    };
    const headers = setHeaders({}, 624457);
    const { body } = await request(app)
      .post(`${baseURL}/teams/534687/agents/556396/agent-settings`)
      .send(payload)
      .set(headers)
      .expect(200);

    expect(body).toMatchObject({});
  });
});
