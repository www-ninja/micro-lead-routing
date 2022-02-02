const request = require('supertest');
const express = require('express');
const { ALGORITHMS } = require('leadrouting-common/enums');
const routes = require('../../src/routes');
const createRoute = require('./utilitiy/createRoute');
const { setHeaders } = require('../utils/helpers');

jest.mock('leadrouting-common/requests/getUser');
jest.mock('leadrouting-common/requests/getOrgsByAgentId');
jest.mock('leadrouting-common/requests/getAgentsByOrgId');
jest.mock('leadrouting-common/requests/getSources');
jest.mock('leadrouting-common/requests/getAem');

describe('PUT /teams/:teamId/routes/assign-to-agent/:routeId', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';

  const defaultUpdateBody = {
    title: 'Update ATA route',
    disabled: false,
    deleted_at: 1,
    settings: {
      active_days: 127,
      active_from: 0,
      active_until: 0,
      rerouting_delay: 364,
      timezone: 'UTC+2',
      is_simple_weight: true,
    },
    sources: [456],
  };

  const defaultCreateBody = {
    title: 'Create ATA Route',
    team_id: 534687,
    creator_kwuid: '624457',
    disabled: false,
    settings: {
      active_days: 127,
      active_from: 0,
      active_until: 0,
      algorithm: ALGORITHMS.ATA,
      rerouting_delay: 364,
      timezone: 'UTC+2',
      is_simple_weight: true,
    },
    agents: [{ id: 624457, weight: 0 }],
    is_all_sources: false,
    sources: [123],
  };

  test('Should return 409 if is_all_sources is true', async () => {
    const route = await createRoute(app, defaultCreateBody);

    const updateBody = {
      ...defaultUpdateBody,
      is_all_sources: true,
    };
    const headers = setHeaders({}, 624457);

    const { body } = await request(app)
      .put(`${baseURL}/teams/534687/routes/assign-to-agent/${route.id}`)
      .send(updateBody)
      .set(headers)
      .expect(409);
    expect(body).toMatchObject({ error: "[is_all_sources] can't be True" });
  });

  test('Should return 409 if teamId does not have any team member', async () => {
    const route = await createRoute(app, defaultCreateBody);
    const headers = setHeaders({ authorization: 'associate' }, 624457);

    const { body } = await request(app)
      .put(`${baseURL}/teams/123/routes/assign-to-agent/${route.id}`)
      .send(defaultUpdateBody)
      .set(headers)
      .expect(409);
    expect(body).toMatchObject({ error: 'You are not a member of team with ID 123' });
  });

  test('Should return 422 if the provided route is not ATA', async () => {
    const route = await createRoute(app);
    const headers = setHeaders({}, 624457);

    const { body } = await request(app)
      .put(`${baseURL}/teams/534687/routes/assign-to-agent/${route.id}`)
      .send(defaultUpdateBody)
      .set(headers)
      .expect(422);
    expect(body).toMatchObject({ error: 'The route is not ATA' });
  });

  test('Should return 409 if userid does not match to any agentID in route', async () => {
    const createBody = {
      ...defaultCreateBody,
      agents: [{ id: 556396, weight: 0 }],
    };

    const route = await createRoute(app, createBody);
    const headers = setHeaders({}, 624457);

    // userId: 624457
    const { body } = await request(app)
      .put(`${baseURL}/teams/534687/routes/assign-to-agent/${route.id}`)
      .send(defaultUpdateBody)
      .set(headers)
      .expect(409);
    expect(body).toMatchObject({ error: 'You don\'t have permission for this Route' });
  });

  test('Should return 204', async () => {
    const route = await createRoute(app, defaultCreateBody);
    const headers = setHeaders({}, 624457);

    const { body } = await request(app)
      .put(`${baseURL}/teams/534687/routes/assign-to-agent/${route.id}`)
      .send(defaultUpdateBody)
      .set(headers)
      .expect(204);
    expect(body).toMatchObject({});
  });
});
