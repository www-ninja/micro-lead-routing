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

describe('PUT /teams/:teamId/routes/order', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';
  const teamId = 534687;

  test('Should retrun 400 if order in payload is invalid', async () => {
    const payload = {
      routes: [
        { order: 'string' },
        { order: 2 },
      ],
    };
    const headers = setHeaders({}, 624457);
    await request(app)
      .put(`${baseURL}/teams/${teamId}/routes/order`)
      .send(payload)
      .set(headers)
      .expect(400);
  });

  test('Should retrun 200 and route updated if route exists', async () => {
    const route1 = await createRoute(app, { title: 'Route1' });
    const route2 = await createRoute(app, { title: 'Route2' });
    const payload = {
      routes: [
        { route_id: route1.id, order: 1 },
        { route_id: route2.id, order: 2 },
      ],
    };
    const headers = setHeaders({}, 624457);
    const { body } = await request(app)
      .put(`${baseURL}/teams/${teamId}/routes/order`)
      .send(payload)
      .set(headers)
      .expect(200);

    expect(body).toEqual(
      expect.arrayContaining(payload.routes),
    );
    expect(body[0].route_id).toBe(route2.id);
  });
});
