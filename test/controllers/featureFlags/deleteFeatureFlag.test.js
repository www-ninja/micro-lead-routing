const request = require('supertest');
const express = require('express');
const { FeatureFlags } = require('leadrouting-common/models');
const routes = require('../../../src/routes');
const { getTeamDetail, getOrgByAgentId } = require('../../../src/services');


const TEST_TEAM = {
  data: {
    id: 532768,
    name: 'Kelle Test Team',
    email: null,
    fax: null,
    phone: null,
    dba_name: null,
    start_dt: '2018-01-01',
    end_dt: null,
    address_1: null,
    address_2: null,
    city: null,
    state: null,
    postal_code: null,
    parent_org_id: 5663,
    country: null,
    member_count: null,
    updated_at: '2021-03-10T14:21:48.000Z',
    org_key: '5000',
    legacy_org_id: null,
    legacy_team_id: 35004,
    legacy_expansion_team_id: null,
    org_type: {
      id: 7,
      name: 'Team',
    },
  },
};

const mockAgentOrg = [
  {
    id: 532768,
    org_type_id: 7,
    name: 'Wrong Org',
    email: null,
    fax: null,
    phone: null,
    dba_name: null,
    start_dt: '2018-01-01',
    end_dt: null,
    address_1: null,
    address_2: null,
    city: null,
    state: null,
    postal_code: null,
    parent_org_id: 5663,
    country: null,
    member_count: null,
    updated_at: '2021-03-10T14:21:48.000Z',
    org_key: '5000',
    legacy_org_id: null,
    legacy_team_id: 35004,
    legacy_expansion_team_id: null,
    org_type: {
      id: 7,
      name: 'Team',
    },
    person_role_orgs: [
      {
        role: {
          id: 65,
          name: 'Buyer Specialist',
          legacy_role_id: 2,
        },
        end_dt: null,
        kw_uid: 556397,
        org_id: 532768,
        role_id: 65,
        start_dt: '2018-01-01',
      },
    ],
  },
];


jest.mock('../../../src/services/getTeamDetail');
jest.mock('../../../src/services/getOrgByAgentId');
jest.mock('leadrouting-common/requests/getServiceToken');

describe('deleteFeatureFlag controller test', () => {
  const app = express();
  const baseURL = '/api/v1';
  app.use(express.json());
  routes(app);
  beforeEach(async () => {
    await FeatureFlags.create({ team_id: 123, user_ids: 'test123,test234' });
  });

  const headers = {
    'x-api-key': 'test123',
    'x-api-feature-flag': '1',
    authorization: 'asd',
  };

  test('request without middleware should return 401', async () => {
    await request(app)
      .del(`${baseURL}/feature-flags/123`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });

  test('DELETE /feature-flags/:teamId should return 200', async () => {
    getTeamDetail.mockImplementationOnce(() => Promise.resolve(TEST_TEAM));
    getOrgByAgentId.mockImplementationOnce(() => Promise.resolve({ ...mockAgentOrg }));
    await request(app)
      .del(`${baseURL}/feature-flags/123`)
      .set(headers)
      .set('Accept', 'application/json')
      .expect(202);
  });

  test('DELETE /feature-flags/:teamId should return 400, if org_type is not Team', async () => {
    getTeamDetail.mockImplementationOnce(() => Promise.resolve({
      ...TEST_TEAM,
      data: {
        org_type: {
          id: 9,
          name: 'Person',
        },
      },
    }));

    getOrgByAgentId.mockImplementationOnce(() => Promise.resolve({ ...mockAgentOrg }));
    await request(app)
      .del(`${baseURL}/feature-flags/123`)
      .set(headers)
      .set('Accept', 'application/json')
      .expect(400);
  });
});
