const createRoute = require('./createRoute');
const updateRoute = require('./updateRoute');
const updateRouteOrder = require('./updateRouteOrder');
const setPausedAgent = require('./setPausedAgent');
const setPausedRoute = require('./setPausedRoute');
const updateRouteATA = require('./updateRouteATA');
const setAgentSettings = require('./setAgentSettings');
const setMaximumLeads = require('./setMaximumLeads');
const queryParams = require('./queryParams.json');
const setFeatureFlag = require('./setFeatureFlag');
const updateFeatureFlag = require('./updateFeatureFlag');

module.exports = {
  createRoute,
  updateRoute,
  updateRouteOrder,
  setPausedAgent,
  setPausedRoute,
  updateRouteATA,
  setAgentSettings,
  setMaximumLeads,
  queryParams,
  setFeatureFlag,
  updateFeatureFlag,
};
