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

describe('DELETE /routes', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';

  test('should delete route', async () => {
    const route = await createRoute(app, { title: 'Test' });
    const headers = setHeaders({}, 624457);

    await request(app)
      .delete(`${baseURL}/teams/534687/routes/${route.id}`)
      .set(headers)
      .expect(202);
  });

  test('Should return 409 - you are not a rainmaker', async () => {
    const headers = setHeaders({}, 1);
    await request(app)
      .delete(`${baseURL}/teams/534687/routes/123`)
      .set(headers)
      .set('authorization', 'associate')
      .expect(409);
  });
});
