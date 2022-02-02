const request = require('supertest');
const { setHeaders } = require('../../utils/helpers');

const baseURL = '/api/v1';

module.exports = async (app, payload) => {
  const defaultPayload = {
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
    is_all_sources: true,
    notification_type: 'all',
    ...payload,
  };
  const headers = setHeaders({}, 624457);
  const { body } = await request(app)
    .post(`${baseURL}/teams/534687/routes`)
    .send(defaultPayload)
    .set(headers)
    .expect('Content-Type', /json/)
    .expect(200);
  return body;
};
