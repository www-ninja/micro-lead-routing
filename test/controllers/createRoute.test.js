const request = require('supertest');
const express = require('express');
const routes = require('../../src/routes');
const { setHeaders } = require('../utils/helpers');

jest.mock('leadrouting-common/requests/getUser');
jest.mock('leadrouting-common/requests/getOrgsByAgentId');
jest.mock('leadrouting-common/requests/getAgentsByOrgId');
jest.mock('leadrouting-common/requests/getSources');
jest.mock('leadrouting-common/requests/getAem');

describe('POST /routes', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';

  test('Should return 409 - teamid 1 doesnt have any team members', async () => {
    const headers = setHeaders({}, 624457);
    const body = { title: 'Title' };
    await request(app)
      .post(`${baseURL}/teams/123/routes`)
      .send(body)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(409);
  });

  test('Should return 409 - you are not a rainmaker', async () => {
    const body = { title: 'Title' };
    const headers = setHeaders({}, 1);

    await request(app)
      .post(`${baseURL}/teams/534687/routes`)
      .send(body)
      .set(headers)
      .expect('Content-Type', /json/)
      .set('authorization', 'associate')
      .expect(409);
  });

  test('should respond with "400" if team_id is not provided', async () => {
    const body = { title: 'Test' };
    const headers = setHeaders({}, 624457);

    const response = await request(app)
      .post(`${baseURL}/teams/534687/routes`)
      .send(body)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toEqual({
      type: 'routes',
      error: 'validation_error',
      error_description: "data should have required property 'team_id'",
    });
  });

  test('should respond with "400" if creator_kwuid is not provided', async () => {
    const body = { team_id: 1 };
    const headers = setHeaders({}, 624457);

    const response = await request(app)
      .post(`${baseURL}/teams/534687/routes`)
      .send(body)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toEqual({
      type: 'routes',
      error: 'validation_error',
      error_description: "data should have required property 'creator_kwuid'",
    });
  });

  test('should respond with "400" if title is not provided', async () => {
    const body = { team_id: 1, creator_kwuid: 1 };
    const headers = setHeaders({}, 624457);

    const response = await request(app)
      .post(`${baseURL}/teams/534687/routes`)
      .send(body)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toEqual({
      type: 'routes',
      error: 'validation_error',
      error_description: "data should have required property 'title'",
    });
  });

  test('should respond with "400" if disabled field is not provided', async () => {
    const body = { team_id: 1, creator_kwuid: 1, title: 'Test' };
    const headers = setHeaders({}, 624457);

    const response = await request(app)
      .post(`${baseURL}/teams/534687/routes`)
      .send(body)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toEqual({
      type: 'routes',
      error: 'validation_error',
      error_description: "data should have required property 'disabled'",
    });
  });

  test('should respond with "400" if active_days is not provided', async () => {
    const body = {
      title: 'Test',
      team_id: 1,
      creator_kwuid: 1,
      disabled: true,
      settings: {},
    };
    const headers = setHeaders({}, 624457);

    const response = await request(app)
      .post(`${baseURL}/teams/534687/routes`)
      .send(body)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toEqual({
      type: 'routes',
      error: 'validation_error',
      error_description: "data.settings should have required property 'active_days'",
    });
  });

  test('should respond with "400" if algorithm is not provided', async () => {
    const body = {
      title: 'Test',
      team_id: 1,
      creator_kwuid: 1,
      disabled: true,
      settings: {
        active_days: 127,
        active_from: 100,
        active_until: 200,
      },
    };
    const headers = setHeaders({}, 624457);

    const response = await request(app)
      .post(`${baseURL}/teams/534687/routes`)
      .send(body)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toEqual({
      type: 'routes',
      error: 'validation_error',
      error_description: "data.settings should have required property 'algorithm'",
    });
  });

  test('should respond with "400" if rerouting_delay is not provided', async () => {
    const body = {
      title: 'Test',
      team_id: 1,
      creator_kwuid: 1,
      disabled: true,
      settings: {
        active_days: 127,
        active_from: 100,
        active_until: 200,
        algorithm: 'Test',
      },
    };
    const headers = setHeaders({}, 624457);

    const response = await request(app)
      .post(`${baseURL}/teams/534687/routes`)
      .send(body)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toEqual({
      type: 'routes',
      error: 'validation_error',
      error_description: "data.settings should have required property 'rerouting_delay'",
    });
  });

  test('should respond with "400" if timezone is not provided', async () => {
    const body = {
      title: 'Test',
      team_id: 1,
      creator_kwuid: 1,
      disabled: true,
      settings: {
        active_days: 127,
        active_from: 100,
        active_until: 200,
        algorithm: 'Test',
        rerouting_delay: 364,
      },
    };
    const headers = setHeaders({}, 624457);

    const response = await request(app)
      .post(`${baseURL}/teams/534687/routes`)
      .send(body)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toEqual({
      type: 'routes',
      error: 'validation_error',
      error_description: "data.settings should have required property 'timezone'",
    });
  });

  test('should respond with "422" if multi agent is provided at ATA route creation', async () => {
    const body = {
      title: 'Test',
      team_id: 534687,
      creator_kwuid: '624457',
      disabled: false,
      settings: {
        active_days: 127,
        active_from: 0,
        active_until: 0,
        algorithm: 'Assign To Agent',
        rerouting_delay: 364,
        timezone: 'UTC+2',
        is_simple_weight: true,
      },
      agents: [
        { id: 556396, weight: 1 },
        { id: 556397, weight: 1 },
      ],
      is_all_sources: true,
      notification_type: 'all',
    };
    const headers = setHeaders({}, 624457);

    const response = await request(app)
      .post(`${baseURL}/teams/534687/routes`)
      .send(body)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(422);

    expect(response.body).toEqual({
      error: 'Route with [Assign To Agent] Algorithm should contain only one Agent.',
    });
  });

  test('should respond with "422" if multi is_all_sources is false at ATA route creation', async () => {
    const body = {
      title: 'Test',
      team_id: 35004,
      creator_kwuid: '624457',
      disabled: false,
      settings: {
        active_days: 127,
        active_from: 0,
        active_until: 0,
        algorithm: 'Assign To Agent',
        rerouting_delay: 364,
        timezone: 'UTC+2',
        is_simple_weight: true,
      },
      agents: [
        { id: 556396, weight: 1 },
      ],
      is_all_sources: true,
      notification_type: 'all',
    };

    const headers = setHeaders({}, 624457);
    await request(app)
      .post(`${baseURL}/teams/534687/routes`)
      .send(body)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(422);
  });

  test('should respond with "200" if required data is provided', async () => {
    const body = {
      title: 'Test',
      team_id: 534687,
      creator_kwuid: '624457',
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
      agents: [{ id: 556396, weight: 1 }],
      is_all_sources: true,
      notification_type: 'all',
    };
    const headers = setHeaders({}, 624457);

    await request(app)
      .post(`${baseURL}/teams/534687/routes`)
      .send(body)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(200);
  });

  test('should respond with "200" with sources', async () => {
    const body = {
      title: 'Test',
      team_id: 534687,
      creator_kwuid: '624457',
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
      is_all_sources: false,
      sources: [1],
      notification_type: 'all',
    };

    const headers = setHeaders({}, 624457);

    await request(app)
      .post(`${baseURL}/teams/534687/routes`)
      .send(body)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(200);
  });
});
