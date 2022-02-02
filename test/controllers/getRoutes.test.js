const request = require('supertest');
const express = require('express');
const { times } = require('lodash');
const routes = require('../../src/routes');
const createRoute = require('./utilitiy/createRoute');
const { setHeaders } = require('../utils/helpers');

jest.mock('leadrouting-common/requests/getUser');
jest.mock('leadrouting-common/requests/getOrgsByAgentId');
jest.mock('leadrouting-common/requests/getAgentsByOrgId');
jest.mock('leadrouting-common/requests/getSources');
jest.mock('leadrouting-common/requests/getAem');

describe('GET /routes', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';

  test('should return valid data', async () => {
    const route = await createRoute(app);
    route.attributes.settings.routeId = route.attributes.settings.RouteId;
    delete route.attributes.settings.RouteId;
    const headers = setHeaders({}, 624457);

    const response = await request(app)
      .get(`${baseURL}/teams/534687/routes`)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.total).toBe(1);
    expect(response.body.data[0]).toMatchObject(route);
  });

  test('should return routes', async () => {
    const routeNum = 3;
    await Promise.all(
      times(routeNum).map((index) => createRoute(app, { title: `Route${index}` })),
    );
    const headers = setHeaders({}, 624457);

    const response = await request(app)
      .get(`${baseURL}/teams/534687/routes`)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.total).toBe(routeNum);
  });
});
