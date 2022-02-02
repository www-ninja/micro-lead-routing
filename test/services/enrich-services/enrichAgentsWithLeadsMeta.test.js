/* eslint-disable max-len */
const enrichAgentsWithLeadsMeta = require('../../../src/services/enrich-services/enrichAgentsWithLeadsMeta');

describe('Service [enrichAgentsWithLeadsMeta]', () => {
  const teamStatisticMeta = {
    data: {
      team: {
        lead_worked: 2,
        active_leads: null,
        captured_leads: 0,
        given_leads: 0,
        speed_to_claim: null,
        speed_to_lead: null,
        team_id: '12345',
        appointments: 0,
        appointments_ratio: 0,
        closed_units: 0,
        closed_units_ratio: 0,
        under_contract: 0,
        under_contract_ratio: 0,
      },
      agents: {
        1: {
          lead_worked: 2,
          active_leads: 0,
          captured_leads: 5,
          given_leads: 3,
          speed_to_claim: 0,
          speed_to_lead: 0,
          team_id: '12345',
          appointments: 0,
          appointments_ratio: 0,
          closed_units: 0,
          closed_units_ratio: 0,
          under_contract: 3,
          under_contract_ratio: 0,
          active_leads_ratio: 0,
        },
      },
    },
  };
  test('Should enrich agents with meta', () => {
    const agents = [
      { kw_uid: 1 },
    ];

    enrichAgentsWithLeadsMeta(agents, teamStatisticMeta);

    expect(agents).toStrictEqual([
      {
        kw_uid: 1, given_leads: 3, captured_leads: 5, lead_worked: 2, active_leads: 0, appointments: 0, closed_units: 0, speed_to_claim: 0, speed_to_lead: 0, under_contract: 3, appointments_ratio: 0, closed_units_ratio: 0, under_contract_ratio: 0, active_leads_ratio: 0,
      },
    ]);
  });

  test('Should ignore irrelevant assignments and claims', () => {
    const agents = [
      { kw_uid: 1 },
    ];

    enrichAgentsWithLeadsMeta(agents, teamStatisticMeta);

    expect(agents).toStrictEqual([{
      kw_uid: 1, given_leads: 3, captured_leads: 5, lead_worked: 2, active_leads: 0, appointments: 0, closed_units: 0, speed_to_claim: 0, speed_to_lead: 0, under_contract: 3, appointments_ratio: 0, closed_units_ratio: 0, under_contract_ratio: 0, active_leads_ratio: 0,
    }]);
  });
});
