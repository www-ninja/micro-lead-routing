const request = require('supertest');

const moment = require('moment');
const { LeadRoutings, LeadRoutingAgent } = require('leadrouting-common/models');
const app = require('../../src/app');
const createRoute = require('./utilitiy/createRoute');
const { setHeaders } = require('../utils/helpers');

jest.mock('leadrouting-common/requests/getUser');
jest.mock('leadrouting-common/requests/getOrgsByAgentId');
jest.mock('leadrouting-common/requests/getAgentsByOrgId');
jest.mock('leadrouting-common/requests/getSources');
jest.mock('leadrouting-common/requests/getAgentById');
jest.mock('leadrouting-common/requests/getContactById');
jest.mock('leadrouting-common/requests/claimLead');
jest.mock('leadrouting-common/requests/getAem');

const leadTeamId = '534687';
const baseURL = '/api/v1';

const initLeadRouting = async (leadId, route, agentId = '624457') => {
  const leadData = {
    lead_id: leadId,
    lead_owner_kwuid: agentId,
    lead_routed_at: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
    lead_source_ids: 1,
    lead_full_name: 'Santiago',
    lead_team_id: leadTeamId,
    route_team_id: leadTeamId,
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

const claimLead = async (leadId) => {
  const headers = setHeaders({}, 624457);
  await request(app)
    .patch(`${baseURL}/leads/${leadId}/claim`)
    .set(headers);
};


describe('GET /leads/digest', () => {
  const agentId = '624457';
  const leadId = '0000000000000000003dc413';
  test('should return 200', async () => {
    const route = await createRoute(app);
    await initLeadRouting(leadId, route, agentId);

    const startDate = moment().subtract(9, 'days').format('YYYY-MM-DD HH:mm:ss');
    const endDate = moment().add(9, 'days').format('YYYY-MM-DD HH:mm:ss');
    const headers = setHeaders({}, agentId);
    const { body } = await request(app)
      .get(`${baseURL}/leads/digest?teamId=${leadTeamId}&startDate=${startDate}&endDate=${endDate}`)
      .set(headers);
    expect(body).toMatchObject({
      claimed_leads: 0,
      end_date: endDate,
      kwuid: '624457',
      leads_routed: 0,
      leads_unrouted: 1,
      start_date: startDate,
      team_id: '534687',
      unclaimed_leads: 1,
    });
  });
  test('should return 200, claimedLeads should be 1', async () => {
    const route = await createRoute(app);
    await initLeadRouting(leadId, route, agentId);
    await claimLead(leadId);

    const startDate = moment().subtract(9, 'days').format('YYYY-MM-DD HH:mm:ss');
    const endDate = moment().add(9, 'days').format('YYYY-MM-DD HH:mm:ss');
    const headers = setHeaders({}, agentId);

    const { body } = await request(app)
      .get(`${baseURL}/leads/digest?teamId=${leadTeamId}&startDate=${startDate}&endDate=${endDate}`)
      .set(headers);
    expect(body).toMatchObject({
      claimed_leads: 1,
      end_date: endDate,
      kwuid: '624457',
      leads_routed: 0,
      leads_unrouted: 1,
      start_date: startDate,
      team_id: '534687',
      unclaimed_leads: 0,
    });
  });
});
