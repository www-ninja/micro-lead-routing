const { get } = require('lodash');

/**
 * teamId
 *
 * teamStatistic
 * @param {[{ data: { team: { active_leads: number, speed_to_lead: number, speed_to_claim, appointment, under_contract, closed }} }]}
 */
module.exports = (teamId, teamStatistic) => {
  const team = get(teamStatistic, 'data.team', {});
  return {
    id: teamId,
    type: 'teams',
    attributes: {
      team_id: teamId,
      given_leads: get(team, 'given_leads', 0),
      captured_leads: get(team, 'captured_leads', 0),
      lead_worked: get(team, 'lead_worked', 0),
      active_leads: get(team, 'active_leads', 0),
      speed_to_lead: get(team, 'speed_to_lead', 0),
      speed_to_claim: get(team, 'speed_to_claim', 0),
      appointments: get(team, 'appointments', 0),
      under_contract: get(team, 'under_contract', 0),
      closed_units: get(team, 'closed_units', 0),
      appointments_ratio: get(team, 'appointments_ratio', 0),
      under_contract_ratio: get(team, 'under_contract_ratio', 0),
      closed_units_ratio: get(team, 'closed_units_ratio', 0),
    },
  };
};
