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

describe('PATCH /teams/:teamId/routes/:routeId/disable', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';
  const teamId = 534687;

  test('Should retrun 404 if route does not exist', async () => {
    const headers = setHeaders({}, 624457);
    await request(app)
      .patch(`${baseURL}/teams/${teamId}/routes/123/disable`)
      .set(headers)
      .expect(404);
  });

  test('Should retrun 200 and route updated if route exists', async () => {
    const disabled = false;
    const route = await createRoute(app, { disabled });
    const headers = setHeaders({}, 624457);
    const { body } = await request(app)
      .patch(`${baseURL}/teams/${teamId}/routes/${route.id}/disable`)
      .set(headers)
      .expect(200);

    expect(body.disabled).toBe(!disabled);
  });
});
