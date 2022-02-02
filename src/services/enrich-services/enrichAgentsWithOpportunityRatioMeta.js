const { groupBy, get, head } = require('lodash');

/* eslint-disable no-param-reassign */
module.exports = (agents, claimsMeta, teamStatisticMeta) => {
  const teamStatisticMetaHash = groupBy(teamStatisticMeta, 'agent_kwuid');
  const agentClaimHash = groupBy(claimsMeta, 'claimed_by_kwuid', 0);

  agents.forEach((agent) => {
    const appointment = get(head(teamStatisticMetaHash[agent.kw_uid]), 'appointment', 0);
    const underContract = get(head(teamStatisticMetaHash[agent.kw_uid]), 'under_contract', 0);
    const closedUnit = get(head(teamStatisticMetaHash[agent.kw_uid]), 'closed', 0);
    const totalClaimedLeads = get(head(agentClaimHash[agent.kw_uid]), 'count', 0);

    agent.appointments_ratio = +(appointment / totalClaimedLeads).toFixed(2) || 0;
    agent.under_contract_ratio = +(underContract / totalClaimedLeads).toFixed(2) || 0;
    agent.closed_units_ratio = +(closedUnit / totalClaimedLeads).toFixed(2) || 0;
  });
};
