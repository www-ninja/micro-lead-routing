const { get } = require('lodash');

/**
 * Enriches each agents with statistic data
 * @param {[{ kw_uid: number, }]} agents
 * @param {[{ data: { agentId: { active_leads: number, speed_to_lead: number, speed_to_claim, appointment, under_contract, closed }} }]} teamStatistic
 */
module.exports = (agents, teamStatistic) => {
  const { data: { agents: agentStats } } = teamStatistic;
  /* eslint-disable no-param-reassign */
  agents.forEach((agent) => {
    const activeLeads = get(agentStats[agent.kw_uid], 'active_leads', 0);
    const capturedLeads = get(agentStats[agent.kw_uid], 'captured_leads', 0);
    const activeLeadsRatio = +((activeLeads / capturedLeads).toFixed(2));
    agent.given_leads = get(agentStats[agent.kw_uid], 'given_leads', 0);
    agent.captured_leads = capturedLeads;
    agent.lead_worked = get(agentStats[agent.kw_uid], 'lead_worked', 0);
    agent.active_leads = activeLeads;
    agent.speed_to_lead = get(agentStats[agent.kw_uid], 'speed_to_lead', 0);
    agent.speed_to_claim = get(agentStats[agent.kw_uid], 'speed_to_claim', 0);
    agent.appointments = get(agentStats[agent.kw_uid], 'appointments', 0);
    agent.under_contract = get(agentStats[agent.kw_uid], 'under_contract', 0);
    agent.closed_units = get(agentStats[agent.kw_uid], 'closed_units', 0);
    agent.under_contract_ratio = get(agentStats[agent.kw_uid], 'under_contract_ratio', 0);
    agent.appointments_ratio = get(agentStats[agent.kw_uid], 'appointments_ratio', 0);
    agent.closed_units_ratio = get(agentStats[agent.kw_uid], 'closed_units_ratio', 0);
    agent.active_leads_ratio = activeLeadsRatio;
  });
};
