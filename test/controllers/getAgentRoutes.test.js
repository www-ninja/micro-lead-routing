const request = require('supertest');
const app = require('../../src/app');
const createRoute = require('./utilitiy/createRoute');
const { setHeaders } = require('../utils/helpers');

jest.mock('leadrouting-common/requests/getUser');
jest.mock('leadrouting-common/requests/getOrgsByAgentId');
jest.mock('leadrouting-common/requests/getAgentsByOrgId');
jest.mock('leadrouting-common/requests/getSources');
jest.mock('leadrouting-common/requests/getAem');

describe('PATCH /leads/:leadId/claim', () => {
  const baseURL = '/api/v1';
  test('Should return 409 - you are not a rainmaker', async () => {
    const headers = setHeaders({}, 1);
    await request(app)
      .get(`${baseURL}/teams/534687/agents/556397/routes`)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(409);
  });

  test('Should return 200, But count is zero', async () => {
    await createRoute(app);
    const headers = setHeaders({}, 624457);
    const res = await request(app)
      .get(`${baseURL}/teams/534687/agents/556397/routes`)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(res.body.total).toEqual(0);
  });
  test('Should return 409, Team does not have any members', async () => {
    await createRoute(app);
    const headers = setHeaders({}, 624457);

    const res = await request(app)
      .get(`${baseURL}/teams/534688/agents/556397/routes`)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(409);
    expect(res.body).toEqual({
      error: 'You are not a member of team with ID 534688',
    });
  });
  test('Should return 200 and body length is 1', async () => {
    await createRoute(app);
    const headers = setHeaders({}, 624457);

    const res = await request(app)
      .get(`${baseURL}/teams/534687/agents/556396/routes`)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(res.body.total).toEqual(1);
  });
});
