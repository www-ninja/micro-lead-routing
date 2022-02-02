const request = require('supertest');
const express = require('express');
const moment = require('moment');
const { LeadRoutings, LeadRoutingAgent } = require('leadrouting-common/models');
const routes = require('../../src/routes');
const createRoute = require('./utilitiy/createRoute');
const { setHeaders } = require('../utils/helpers');

jest.mock('leadrouting-common/requests/getSources');
jest.mock('leadrouting-common/requests/getUser');
jest.mock('leadrouting-common/requests/getOrgsByAgentId');
jest.mock('leadrouting-common/requests/getAgentsByOrgId');
jest.mock('leadrouting-common/requests/getAem');

const initLeadRouting = async (leadId, route, agentId = '624457') => {
  const leadData = {
    lead_id: leadId,
    lead_owner_kwuid: agentId,
    lead_routed_at: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
    lead_source_ids: 1,
    lead_full_name: 'Santiago',
    lead_team_id: '534687',
  };

  const leadRouting = await LeadRoutings.create(
    leadData,
    { include: [LeadRoutingAgent], raw: true },
  );

  await leadRouting.update({
    route_id: route.id,
    route_title: route.attributes.title,
    route_team_id: route.attributes.team_id,
    route_algorithm: route.attributes.settings.algorithm,
    route_round_delay: route.attributes.settings.rerouting_delay,
    route_timezone: 1,
    is_simple_weight: route.attributes.settings.is_simple_weight,
  });

  const routeAgents = route.attributes.agents.map(({ attributes }) => ({
    lead_routing_id: leadRouting.id,
    agent_kwuid: agentId,
    agent_weight: attributes.weight,
    notified_at: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
  }));

  await LeadRoutingAgent.bulkCreate(routeAgents);
};

describe('GEt /teams/:teamId/source-ranks', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';

  test('Should return empty array of source ranks if leadrouting does not exist', async () => {
    const headers = setHeaders({}, 624457);
    const { body } = await request(app)
      .get(`${baseURL}/teams/534687/source-ranks`)
      .set(headers)
      .expect(200);

    expect(body.source_ranks.length).toBe(0);
  });

  test('Should return one array', async () => {
    const route = await createRoute(app, {
      is_all_sources: false,
      sources: [123],
    });
    const leadId = 388832;
    const agentId = '624457';
    await initLeadRouting(leadId, route, agentId);

    const endDate = moment().endOf('month').format('YYYY-MM-DD HH:mm:ss');
    const headers = setHeaders({}, agentId);

    const { body } = await request(app)
      .get(`${baseURL}/teams/534687/source-ranks?endDate=${endDate}`)
      .set(headers)
      .expect(200);

    expect(body.source_ranks.length).toBe(1);
  });
});
