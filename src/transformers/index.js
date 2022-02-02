const agentsTransformer = require('./agentsTransformer');
const agentPauseTransformer = require('./agentPauseTransformer');
const routePauseTransformer = require('./routePauseTransformer');
const getLeadNotifications = require('./getLeadsNotifications');
const agentRoutesTransformer = require('./agentRoutesTransformer');
const agentStatsTransformer = require('./agentStatsTransformer');
const featureFlagTransformer = require('./featureFlagTransformer');
const featureFlagsTransformer = require('./featureFlagsTransformer');

// TODO: consider using JSONAPISerializer transformer
const transformRoutes = require('./transformRoutes');

module.exports = {
  agentsTransformer,
  agentPauseTransformer,
  routePauseTransformer,
  transformRoutes,
  getLeadNotifications,
  agentRoutesTransformer,
  agentStatsTransformer,
  featureFlagTransformer,
  featureFlagsTransformer,
};
