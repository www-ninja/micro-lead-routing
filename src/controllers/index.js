const deleteRoute = require('./deleteRoute');
const getRoutes = require('./getRoutes');
const getAgents = require('./getAgents');
const getAgentStats = require('./getAgentStats');
const createRoute = require('./createRoute');
const validateTitle = require('./validateTitle');
const updateRoute = require('./updateRoute');
const updateRouteATA = require('./updateRouteATA');
const updateRoutesOrder = require('./updateRoutesOrder');
const updateDisabledStatus = require('./updateDisabledStatus');
const getPausedAgent = require('./getPausedAgent');
const setPausedAgent = require('./setPausedAgent');
const getPausedRoutes = require('./getPausedRoutes');
const setPausedRoute = require('./setPausedRoute');
const getAssignedLeads = require('./getAssignedLeads');
const claimLead = require('./claimLead');
const getLeadPoolCount = require('./getLeadPoolCount');
const passLead = require('./passLead');
const getLeadDigest = require('./getLeadDigest');
const getArchivedRoutes = require('./getArchivedRoutes');
const restoreArchivedRoute = require('./restoreArchivedRoute');
const getAgentRoutes = require('./getAgentRoutes');
const setAgentSettings = require('./setAgentSettings');
const getSourceRanks = require('./getSourceRanks');
const setMaximumLeads = require('./setMaximumLeads');
const getAgentSettings = require('./getAgentSettings');
const featureFlags = require('./featureFlags');

module.exports = {
  ...featureFlags,
  deleteRoute,
  getRoutes,
  getAgents,
  getAgentStats,
  createRoute,
  validateTitle,
  updateRoute,
  updateRouteATA,
  updateRoutesOrder,
  updateDisabledStatus,
  getPausedAgent,
  setPausedAgent,
  getPausedRoutes,
  setPausedRoute,
  getAssignedLeads,
  claimLead,
  passLead,
  getLeadPoolCount,
  getLeadDigest,
  getArchivedRoutes,
  restoreArchivedRoute,
  getAgentRoutes,
  setAgentSettings,
  getSourceRanks,
  setMaximumLeads,
  getAgentSettings,
};
