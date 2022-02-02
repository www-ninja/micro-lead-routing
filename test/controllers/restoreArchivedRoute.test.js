const request = require('supertest');
const express = require('express');
const { Routes } = require('leadrouting-common/models');
const routes = require('../../src/routes');
const createRoute = require('./utilitiy/createRoute');
const { setHeaders } = require('../utils/helpers');

jest.mock('leadrouting-common/requests/getUser');
jest.mock('leadrouting-common/requests/getOrgsByAgentId');
jest.mock('leadrouting-common/requests/getAgentsByOrgId');
jest.mock('leadrouting-common/requests/getSources');
jest.mock('leadrouting-common/requests/getAem');

describe('PATCH /teams/:teamId/routes/:routeId/restore', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';

  test('Should return 409 - you are not a rainmaker if non-rainmaker', async () => {
    const headers = setHeaders({}, 1);
    await request(app)
      .patch(`${baseURL}/teams/534687/routes/123/restore`)
      .set(headers)
      .expect(409);
  });

  test('Should return 404 if route doesn t exist', async () => {
    const headers = setHeaders({}, 624457);
    await request(app)
      .patch(`${baseURL}/teams/534687/routes/123/restore`)
      .set(headers)
      .expect(404);
  });

  test('deleted_at of route should be null if successfully restored', async () => {
    const route = await createRoute(app);
    const realRoute = await Routes.findByPk(route.id);
    await realRoute.destroy();
    const headers = setHeaders({}, 624457);

    const { body } = await request(app)
      .patch(`${baseURL}/teams/534687/routes/${route.id}/restore`)
      .set(headers)
      .expect(200);

    expect(body.attributes.deleted_at).toBe(null);
  });
});
