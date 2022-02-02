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

describe('POST /routes/validate/title', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';

  test('should respond with empty data if provided route is unique', async () => {
    const title = 'valid route';
    const route = await createRoute(app, { title });
    const body = { title };
    const headers = setHeaders({}, 624457);

    const response = await request(app)
      .post(`${baseURL}/teams/35004/routes/${route.id}/validate/title`)
      .send(body)
      .set(headers)
      .expect(200);

    expect(response.body).toEqual({ data: null });
  });
});
