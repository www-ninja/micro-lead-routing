const request = require('supertest');
const express = require('express');
const routes = require('../../../src/routes');
const { getTeamDetail, getOrgByAgentId } = require('../../../src/services');
const { TEAM_ID_VALIDATION_ERROR } = require('../../../src/constants');

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

describe('createFeatureFlag controller test', () => {
  const app = express();
  const baseURL = '/api/v1';
  app.use(express.json());
  routes(app);

  const headers = {
    'x-api-key': 'test123',
    'x-api-feature-flag': '1',
    authorization: 'asd',
  };

  test('request without middleware should return 401', async () => {
    const body = { userIds: ['test'] };
    await request(app)
      .post(`${baseURL}/feature-flags/123`)
      .set('Accept', 'application/json')
      .send(body)
      .expect('Content-Type', /json/)
      .expect(401);
  });

  test('POST /feature-flags/:teamId should return 200', async () => {
    getTeamDetail.mockImplementationOnce(() => Promise.resolve(TEST_TEAM));
    await getOrgByAgentId.mockImplementationOnce(() => Promise.resolve({ ...mockAgentOrg }));
    const body = { userIds: ['556397'] };
    await request(app)
      .post(`${baseURL}/feature-flags/532768`)
      .set(headers)
      .set('Accept', 'application/json')
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200);
  });

  test('POST /feature-flags/:teamId should return 400, user not member of the team', async () => {
    getTeamDetail.mockImplementationOnce(() => Promise.resolve(TEST_TEAM));
    getOrgByAgentId.mockImplementationOnce(() => Promise.resolve());
    const body = { userIds: ['556397'] };
    await request(app)
      .post(`${baseURL}/feature-flags/532768`)
      .set(headers)
      .set('Accept', 'application/json')
      .send(body)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  test('POST /feature-flags/:teamId should return 400, not team org type', async () => {
    getTeamDetail.mockImplementationOnce(() => Promise.resolve({
      ...TEST_TEAM,
      data: {
        org_type: {
          id: 9,
          name: 'Person',
        },
      },
    }));
    await getOrgByAgentId.mockImplementationOnce(() => Promise.resolve({ ...mockAgentOrg }));
    const body = { userIds: ['556397'] };
    const resp = await request(app)
      .post(`${baseURL}/feature-flags/532768`)
      .set(headers)
      .set('Accept', 'application/json')
      .send(body)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(resp.body).toEqual({ message: TEAM_ID_VALIDATION_ERROR.invalidOrgType(532768) });
  });

  test('POST /feature-flags/:teamId should return 400 if userIds is empty arr', async () => {
    getTeamDetail.mockImplementationOnce(() => Promise.resolve({ data: null }));
    const body = { userIds: ['556397'] };
    await request(app)
      .post(`${baseURL}/feature-flags/123`)
      .set(headers)
      .set('Accept', 'application/json')
      .send(body)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  test('POST /feature-flags/:teamId should return 400 if has duplicate item on array', async () => {
    getTeamDetail.mockImplementationOnce(() => Promise.resolve(TEST_TEAM));
    const payload = { userIds: ['newTestId', 'newTestId'] };
    await request(app)
      .post(`${baseURL}/feature-flags/123`)
      .send(payload)
      .set(headers)
      .set('Accept', 'application/json')
      .expect(400);
  });
});
