const request = require('supertest');
const { LeadRoutings, LeadRoutingAgent } = require('leadrouting-common/models');
const moment = require('moment');
const app = require('../../src/app');
const createRoute = require('./utilitiy/createRoute');
const { setHeaders } = require('../utils/helpers');

jest.mock('leadrouting-common/requests/getUser');
jest.mock('leadrouting-common/requests/getOrgsByAgentId');
jest.mock('leadrouting-common/requests/getAgentsByOrgId');
jest.mock('leadrouting-common/requests/getSources');
jest.mock('leadrouting-common/requests/getContactById');
jest.mock('leadrouting-common/requests/claimLead');
jest.mock('leadrouting-common/requests/getAem');

const initLeadRouting = async (leadId, route, agentId = '624457') => {
  const leadData = {
    lead_id: leadId,
    lead_owner_kwuid: agentId,
    lead_routed_at: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
    lead_source_ids: 1,
    lead_full_name: 'Santiago',
    route_team_id: '534687',
  };

  const leadRouting = await LeadRoutings.create(
    leadData,
    { include: [LeadRoutingAgent], raw: true },
  );

  const routeAgents = route.attributes.agents.map(({ attributes }) => ({
    lead_routing_id: leadRouting.id,
    agent_kwuid: agentId,
    agent_weight: attributes.weight,
    notified_at: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
  }));

  await LeadRoutingAgent.bulkCreate(routeAgents);
};
describe('PATCH /leads/:leadId/claim', () => {
  const baseURL = '/api/v1';

  const leadId = '0000000000000000003dc413';
  test('should return 200', async () => {
    const route = await createRoute(app);
    const headers = setHeaders({}, 624457);
    await initLeadRouting(leadId, route);
    await request(app)
      .patch(`${baseURL}/leads/${leadId}/claim`)
      .set(headers)
      .set('authorization', 'rainmaker')
      .expect('Content-Type', /json/)
      .expect(200);
  });
  test('should return 404', async () => {
    const route = await createRoute(app);
    const headers = setHeaders({}, 624457);
    await initLeadRouting('test lead', route);
    const res = await request(app)
      .patch(`${baseURL}/leads/${leadId}/claim`)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(404);
    expect(res.body.error).toBe("The lead doesn't exist");
  });
  test('should return 404', async () => {
    const route = await createRoute(app);
    const headers = setHeaders({}, 624457);
    await initLeadRouting(leadId, route, '123456');
    const res = await request(app)
      .patch(`${baseURL}/leads/${leadId}/claim`)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(404);
    expect(res.body.error).toBe("The lead doesn't exist");
  });
});
