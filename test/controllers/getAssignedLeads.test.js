const request = require('supertest');

const moment = require('moment');
const { LeadRoutings, LeadRoutingAgent } = require('leadrouting-common/models');
const { ALGORITHMS } = require('leadrouting-common/enums');
const app = require('../../src/app');
const createRoute = require('./utilitiy/createRoute');
const { setHeaders } = require('../utils/helpers');

const initLeadRouting = async (leadId, route, agentId = '624457', payload) => {
  const leadData = {
    lead_id: leadId,
    lead_owner_kwuid: agentId,
    lead_routed_at: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
    lead_source_ids: 1,
    lead_full_name: 'Santiago',
    lead_team_id: '23456',
    to_check_at: payload.to_check_at,
    route_algorithm: payload.route_algorithm,
    route_round_delay: 180,
  };

  const leadRouting = await LeadRoutings.create(
    leadData,
    { include: [LeadRoutingAgent], raw: true },
  );

  const routeAgents = route.attributes.agents.map(({ attributes }) => ({
    lead_routing_id: leadRouting.id,
    agent_kwuid: attributes.id,
    agent_weight: attributes.weight,
    notified_at: +attributes.id === +agentId ? payload.notified_at : null,
    passed_at: +attributes.id === +agentId ? payload.passed_at : null,
  }));
  await LeadRoutingAgent.bulkCreate(routeAgents);
};


jest.mock('leadrouting-common/requests/getUser');
jest.mock('leadrouting-common/requests/getOrgsByAgentId');
jest.mock('leadrouting-common/requests/getAgentsByOrgId');
jest.mock('leadrouting-common/requests/getSources');
jest.mock('leadrouting-common/requests/getAgentById');
jest.mock('leadrouting-common/requests/getContacts');
jest.mock('leadrouting-common/requests/claimLead');
jest.mock('leadrouting-common/requests/getAem');

describe('GET /agents/:agentId/available-leads', () => {
  const baseURL = '/api/v1';
  const agentId = '624457';
  const leadId = '0000000000000000003e04f7';
  const leadId1 = '0000000000000000003e0520';
  const format = 'YYYY-MM-DD HH:mm:ss';
  const payload = {
    passed_at: moment().subtract(30, 'm').utc().format(format),
    to_check_at: null,
    notified_at: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
  };

  test('other user should return 401', async () => {
    const route = await createRoute(app);
    const headers = setHeaders({}, agentId);
    await initLeadRouting(leadId, route, agentId, payload);

    await request(app)
      .get(`${baseURL}/agents/${agentId}/available-leads`)
      .set(headers)
      .set('authorization', 'agent2');
    expect(401);
  });

  test('agent has been passed the lead should return length 0', async () => {
    const route = await createRoute(app);
    payload.to_check_at = moment().add(30, 'm').format(format);
    await initLeadRouting(leadId, route, agentId, payload);
    const headers = setHeaders({}, agentId);

    const { body } = await request(app)
      .get(`${baseURL}/agents/${agentId}/available-leads`)
      .set(headers);
    expect(body.data.length).toBe(0);
  });

  test('authenticate user should return 200 and length should be 2', async () => {
    const agents = [{ id: agentId, weight: 4 }];
    const route = await createRoute(app, { agents });
    const add30Mins = moment().add(30, 'm').utc().format(format);
    payload.to_check_at = add30Mins;
    payload.notified_at = add30Mins;
    payload.route_algorithm = ALGORITHMS.FCFS;
    delete payload.passed_at;
    await initLeadRouting(leadId, route, agentId, payload);
    await initLeadRouting(leadId1, route, agentId, payload);
    const headers = setHeaders({}, agentId);

    const { body } = await request(app)
      .get(`${baseURL}/agents/${agentId}/available-leads`)
      .set(headers);
    expect(200);
    expect(body.data.length).toBe(2);
  });

  test('only offered agent can see the lead in certain timeframe if algorithm not FCFS', async () => {
    const agents = [{ id: 556396, weight: 1 }, { id: 556397, weight: 3 }, { id: 556398, weight: 2 }, { id: agentId, weight: 4 }];
    const route = await createRoute(app, { agents });
    const add30Mins = moment().add(30, 'm').utc().format(format);
    payload.to_check_at = add30Mins;
    payload.notified_at = add30Mins;
    payload.route_algorithm = ALGORITHMS.R;
    delete payload.passed_at;
    await initLeadRouting(leadId, route, agentId, payload);

    const { body } = await request(app)
      .get(`${baseURL}/agents/${agentId}/available-leads`)
      .set(setHeaders({}, agentId));
    expect(200);
    expect(body.data.length).toBe(1);

    const { body: body2 } = await request(app)
      .get(`${baseURL}/agents/556396/available-leads`)
      .set(setHeaders({}, agents[0].id));
    expect(200);
    expect(body2.data.length).toBe(0);

    const { body: body3 } = await request(app)
      .get(`${baseURL}/agents/556397/available-leads`)
      .set(setHeaders({}, agents[1].id));
    expect(200);
    expect(body3.data.length).toBe(0);

    const { body: body4 } = await request(app)
      .get(`${baseURL}/agents/556398/available-leads`)
      .set(setHeaders({}, agents[2].id));
    expect(200);
    expect(body4.data.length).toBe(0);
  });

  test('passed leads should not shown in the list', async () => {
    const agents = [{ id: 556396, weight: 1 }, { id: 556397, weight: 3 }, { id: 556398, weight: 2 }, { id: agentId, weight: 4 }];
    const route = await createRoute(app, { agents });
    const add30Mins = moment().add(30, 'm').utc().format(format);
    payload.to_check_at = add30Mins;
    payload.notified_at = add30Mins;
    payload.route_algorithm = ALGORITHMS.FCFS;
    delete payload.passed_at;
    await initLeadRouting(leadId, route, agentId, payload);

    const { body } = await request(app)
      .get(`${baseURL}/agents/${agentId}/available-leads`)
      .set(setHeaders({}, agentId));
    expect(200);
    expect(body.data.length).toBe(1);

    await request(app)
      .get(`${baseURL}/leads/${leadId}/pass`)
      .set(setHeaders({}, agents[0].id));

    const { body: body2 } = await request(app)
      .get(`${baseURL}/agents/${agents[0].id}/available-leads`)
      .set(setHeaders({}, agents[0].id));
    expect(200);
    expect(body2.data.length).toBe(0);
  });
});
