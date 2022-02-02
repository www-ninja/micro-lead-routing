const request = require('supertest');
const express = require('express');
const moment = require('moment');
const { LeadRoutings, LeadRoutingAgent } = require('leadrouting-common/models');
const axios = require('axios');
const routes = require('../../src/routes');
const createRoute = require('./utilitiy/createRoute');
const { setHeaders } = require('../utils/helpers');

jest.mock('leadrouting-common/requests/getUser');
jest.mock('leadrouting-common/requests/getContacts');
jest.mock('leadrouting-common/requests/getOrgsByAgentId');
jest.mock('leadrouting-common/requests/getAgentsByOrgId');
jest.mock('leadrouting-common/requests/getSources');
jest.mock('leadrouting-common/requests/getContactById');
jest.mock('leadrouting-common/requests/getAem');

const initLeadRouting = async (leadId, route, agentId = '624457') => {
  const leadData = {
    lead_id: leadId,
    lead_owner_kwuid: agentId,
    lead_routed_at: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
    lead_source_ids: 1,
    lead_full_name: 'Santiago',
    lead_team_id: '23456',
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

const mockGetServiceToken = () => {
  axios.post = jest.fn().mockImplementation(() => Promise.resolve({
    data: {
      data: {
        token_type: 'Bearer',
        jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      },
    },
  }));
};

describe('POST /leads/:leadId/pass', () => {
  const app = express();
  app.use(express.json());
  routes(app);

  const baseURL = '/api/v1';

  test('Should return 404 if lead does not exist', async () => {
    const headers = setHeaders({}, 624457);
    await request(app)
      .patch(`${baseURL}/leads/123/pass`)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(404);
  });

  test('Should return 200 and pass Lead', async () => {
    const route = await createRoute(app);
    const leadId = '5fb512cafda4be001babf1f7';

    mockGetServiceToken();
    await initLeadRouting(leadId, route);
    const headers = setHeaders({}, 624457);

    const { body } = await request(app)
      .patch(`${baseURL}/leads/${leadId}/pass`)
      .set(headers)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(body.action).toBe('pass');
  });
});
