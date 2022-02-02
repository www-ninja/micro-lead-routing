const request = require('supertest');
const {
  Routes,
} = require('leadrouting-common/models');
const app = require('../../src/app');
const createRoute = require('./utilitiy/createRoute');
const { setHeaders } = require('../utils/helpers');

jest.mock('leadrouting-common/requests/getUser');
jest.mock('leadrouting-common/requests/getOrgsByAgentId');
jest.mock('leadrouting-common/requests/getAgentsByOrgId');
jest.mock('leadrouting-common/requests/getSources');
jest.mock('leadrouting-common/requests/getAem');

describe('GET /teams/:teamId/routes/archived', () => {
  const baseURL = '/api/v1';

  test('should return 1 archived route', async () => {
    const route = await createRoute(app);
    const headers = setHeaders({}, 624457);
    await Routes.destroy({ where: { id: route.id, team_id: route.attributes.team_id } });

    const response = await request(app)
      .get(`${baseURL}/teams/534687/routes/archived`)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.total).toBe(1);
    expect(response.body.data[0].id).toBe(route.id);
  });

  test('should return 0 data', async () => {
    await createRoute(app);
    const headers = setHeaders({}, 624457);

    const response = await request(app)
      .get(`${baseURL}/teams/534687/routes/archived`)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.total).toBe(0);
  });
});
