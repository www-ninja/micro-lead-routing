/* eslint-disable no-param-reassign, no-prototype-builtins */
const { get } = require('lodash');

module.exports = (agent) => {
  const data = {
    id: get(agent, 'id'),
    type: 'agent',
    attributes: {
      first_name: get(agent, 'first_name'),
      last_name: get(agent, 'last_name'),
      email: get(agent, 'email'),
      photo: get(agent, 'photo'),
      lead_worked: get(agent, 'lead_worked'),
      given_leads: get(agent, 'given_leads'),
      captured_leads: get(agent, 'captured_leads'),
      pause_until_ts: get(agent, 'pause_until_ts'),
      active_leads: get(agent, 'active_leads'),
      speed_to_lead: get(agent, 'speed_to_lead'),
      speed_to_claim: get(agent, 'speed_to_claim'),
      appointments: get(agent, 'appointments'),
      under_contract: get(agent, 'under_contract'),
      closed_units: get(agent, 'closed_units'),
      appointments_ratio: get(agent, 'appointments_ratio'),
      under_contract_ratio: get(agent, 'under_contract_ratio'),
      closed_units_ratio: get(agent, 'closed_units_ratio'),
      active_leads_ratio: get(agent, 'active_leads_ratio'),
    },
  };

  return { data };
};
