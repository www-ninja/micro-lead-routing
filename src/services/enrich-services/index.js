const enrichAgentWithPause = require('./enrichAgentWithPause');
const enrichAgentsWithLeadsMeta = require('./enrichAgentsWithLeadsMeta');
const enrichAgentsWithRoutes = require('./enrichAgentsWithRoutes');
const enrichRoutesWithAgents = require('./enrichRoutesWithAgents');
const enrichRoutesWithSources = require('./enrichRoutesWithSources');
const enrichWithTeamStats = require('./enrichWithTeamStats');
const enrichAgentsWithOpportunityRatioMeta = require('./enrichAgentsWithOpportunityRatioMeta');

module.exports = {
  enrichAgentWithPause,
  enrichAgentsWithLeadsMeta,
  enrichAgentsWithRoutes,
  enrichRoutesWithAgents,
  enrichRoutesWithSources,
  enrichWithTeamStats,
  enrichAgentsWithOpportunityRatioMeta,
};
