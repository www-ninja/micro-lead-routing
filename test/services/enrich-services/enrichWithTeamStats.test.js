const enrichWithTeamStats = require('../../../src/services/enrich-services/enrichWithTeamStats');

describe('Service [enrichWithTeamStats]', () => {
  test('Should enrich team statistic', () => {
    const teamStatistic = {
      data: {
        team: {
          given_leads: 10,
          captured_leads: 1,
          lead_worked: 1,
          active_leads: 1,
          speed_to_lead: 1,
          speed_to_claim: 1,
          appointments: 1,
          under_contract: 1,
          closed_units: 1,
          appointments_ratio: 1,
          under_contract_ratio: 1,
          closed_units_ratio: 1,
        },
      },
    };
    const teamId = 30005;

    const data = enrichWithTeamStats(teamId, teamStatistic);

    expect(data).toStrictEqual(
      {
        id: 30005,
        type: 'teams',
        attributes: {
          team_id: teamId,
          given_leads: 10,
          captured_leads: 1,
          lead_worked: 1,
          active_leads: 1,
          speed_to_lead: 1,
          speed_to_claim: 1,
          appointments: 1,
          under_contract: 1,
          closed_units: 1,
          appointments_ratio: 1,
          under_contract_ratio: 1,
          closed_units_ratio: 1,
        },
      },
    );
  });

  test('Should enrich team statistic', () => {
    const teamStatistic = {
      data: {
        team: {},
      },
    };
    const teamId = 30005;

    const data = enrichWithTeamStats(teamId, teamStatistic);

    expect(data).toStrictEqual(
      {
        id: 30005,
        type: 'teams',
        attributes: {
          team_id: teamId,
          given_leads: 0,
          captured_leads: 0,
          lead_worked: 0,
          active_leads: 0,
          speed_to_lead: 0,
          speed_to_claim: 0,
          appointments: 0,
          under_contract: 0,
          closed_units: 0,
          appointments_ratio: 0,
          under_contract_ratio: 0,
          closed_units_ratio: 0,
        },
      },
    );
  });

  test('Should enrich empty team statistic', () => {
    const teamStatistic = null;
    const teamId = 30005;

    const data = enrichWithTeamStats(teamId, teamStatistic);

    expect(data).toStrictEqual(
      {
        id: 30005,
        type: 'teams',
        attributes: {
          team_id: teamId,
          given_leads: 0,
          captured_leads: 0,
          lead_worked: 0,
          active_leads: 0,
          speed_to_lead: 0,
          speed_to_claim: 0,
          appointments: 0,
          under_contract: 0,
          closed_units: 0,
          appointments_ratio: 0,
          under_contract_ratio: 0,
          closed_units_ratio: 0,
        },
      },
    );
  });
});
