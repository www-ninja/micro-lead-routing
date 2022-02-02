/* eslint-disable no-param-reassign, no-prototype-builtins */
const { get } = require('lodash');

module.exports = (agents, team) => {
  const meta = {
    total: agents.length,
  };
  const data = agents.map((agent) => {
    const agentData = {
      id: get(agent, 'kw_uid'),
      type: 'agents',
      attributes: {
        id: get(agent, 'kw_uid'),
        first_name: get(agent, 'first_name'),
        last_name: get(agent, 'last_name'),
        email: get(agent, 'email'),
        photo: get(agent, 'photo'),
        given_leads: get(agent, 'given_leads'),
        captured_leads: get(agent, 'captured_leads'),
        lead_worked: get(agent, 'lead_worked'),
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
      },
    };

    if (agent.routes) {
      agentData.attributes.routes = agent.routes.map((route) => ({
        id: get(route, 'id'),
        title: get(route, 'title'),
        disabled: get(route, 'disabled'),
        creator_kwuid: get(route, 'creator_kwuid'),
        team_id: get(route, 'team_id'),
        is_all_sources: get(route, 'is_all_sources'),
        notification_type: get(route, 'notification_type'),
        order: get(route, 'order'),
        sources: get(route, 'route_sources'),
        settings: get(route, 'route_setting'),
      }));
    }
    return agentData;
  });

  const included = [team];

  return { meta, data, included };
};
