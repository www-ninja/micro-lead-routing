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

describe('PUT /routes', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';

  test('should respond with "204" if required data is provided', async () => {
    const updateBody = {
      title: 'Updated title',
      team_id: 123,
      creator_kwuid: 123,
      disabled: false,
      settings: {
        active_days: 127,
        active_from: 0,
        active_until: 0,
        algorithm: 'First Come, First Serve',
        rerouting_delay: 364,
        timezone: 'UTC+2',
        is_simple_weight: true,
      },
      agents: [{ id: 556396, weight: 0 }],
      is_all_sources: true,
      notification_type: 'all',
    };

    const route = await createRoute(app, { title: 'New Route' });
    const headers = setHeaders({}, 624457);

    await request(app)
      .put(`${baseURL}/teams/534687/routes/${route.id}`)
      .send(updateBody)
      .set(headers)
      .expect(204);
  });
});
