const path = require('path');
const express = require('express');
const Sentry = require('@sentry/node');

const {
  claimLead,
  passLead,
  getRoutes,
  getAgents,
  getAgentStats,
  createRoute,
  validateTitle,
  updateRoute,
  updateRouteATA,
  deleteRoute,
  updateRoutesOrder,
  updateDisabledStatus,
  getPausedAgent,
  setPausedAgent,
  getPausedRoutes,
  setPausedRoute,
  getAssignedLeads,
  getLeadPoolCount,
  getLeadDigest,
  getArchivedRoutes,
  restoreArchivedRoute,
  getAgentRoutes,
  setAgentSettings,
  getSourceRanks,
  setMaximumLeads,
  getAgentSettings,
  getFeatureFlags,
  deleteFeatureFlag,
  updateFeatureFlag,
  createFeatureFlag,
  getFeatureFlagByTeam,
} = require('../controllers');

const {
  validateBody,
  validateRainmaker,
  errorHandler,
  createRouteMiddleware,
  updateRouteATA: updateRouteATAMiddleware,
  validateTeam,
  claimPassLead,
  authentication,
  validateParams,
  privateMiddleware,
  validateTeamId,
} = require('../middlewares');

const router = express.Router();
router.get('/teams/:teamId/routes', authentication, getRoutes);
router.get('/teams/:teamId/routes/archived', authentication, getArchivedRoutes);
router.get('/teams/:teamId/agents', [authentication, validateRainmaker], getAgents);
router.get('/teams/:teamId/agents/:agentId', [validateParams('queryParams'), authentication], getAgentStats);
router.get('/teams/:teamId/agents/:agentId/pause', [validateParams('queryParams'), authentication], getPausedAgent);
router.get('/teams/:teamId/agents/:agentId/routes', [validateParams('queryParams'), authentication, validateRainmaker], getAgentRoutes);
router.get('/teams/:teamId/agents/:agentId/pause/routes', [validateParams('queryParams'), authentication], getPausedRoutes);
router.get('/teams/:teamId/source-ranks', authentication, getSourceRanks);
router.get('/agents/:agentId/available-leads', authentication, getAssignedLeads);
router.post(
  '/teams/:teamId/routes',
  [authentication, validateRainmaker, createRouteMiddleware, validateBody('createRoute')],
  createRoute,
);
router.post('/teams/:teamId/agents/:agentId/pause', [validateParams('queryParams'), authentication, validateBody('setPausedAgent')], setPausedAgent);
router.post(
  '/teams/:teamId/agents/:agentId/pause/routes',
  [validateParams('queryParams'), authentication, validateBody('setPausedRoute')],
  setPausedRoute,
);

router.put('/teams/:teamId/routes/order', [authentication, validateBody('updateRouteOrder')], updateRoutesOrder);
router.post('/teams/:teamId/routes/:routeId/validate/title', authentication, validateTitle);

router.put(
  '/teams/:teamId/routes/assign-to-agent/:routeId',
  [authentication, updateRouteATAMiddleware, validateBody('updateRouteATA')],
  updateRouteATA,
);

router.put(
  '/teams/:teamId/routes/:routeId',
  [authentication, createRouteMiddleware, validateRainmaker, validateBody('updateRoute')],
  updateRoute,
);
router.delete('/teams/:teamId/routes/:routeId', [authentication, validateRainmaker], deleteRoute);
router.patch('/teams/:teamId/routes/:routeId/disable', authentication, updateDisabledStatus);
router.patch('/teams/:teamId/routes/:routeId/restore', [authentication, validateRainmaker], restoreArchivedRoute);
router.patch('/leads/:leadId/claim', [authentication, claimPassLead], claimLead);
router.patch('/leads/:leadId/pass', [authentication, claimPassLead], passLead);

router.get('/teams/:teamId/leads/pooled', authentication, getLeadPoolCount);

router.post(
  '/teams/:teamId/agents/:agentId/agent-settings',
  [validateParams('queryParams'), authentication, validateTeam, validateBody('setAgentSettings')],
  setAgentSettings,
);

router.get(
  '/teams/:teamId/agents/:agentId/agent-settings',
  [validateParams('queryParams'), authentication, validateRainmaker],
  getAgentSettings,
);

router.post(
  '/teams/:teamId/agents/:agentId/maximum-leads',
  [validateParams('queryParams'), authentication, validateRainmaker, validateBody('setMaximumLeads')], setMaximumLeads,
);

router.get('/leads/digest', authentication, getLeadDigest);

// FeatureFlags
router.post('/feature-flags/:teamId', [privateMiddleware, validateBody('setFeatureFlag'), validateTeamId], createFeatureFlag); // create new target
router.get('/feature-flags/:teamId', [privateMiddleware], getFeatureFlagByTeam); // check team targets
router.get('/feature-flags', [privateMiddleware], getFeatureFlags); // get target list
router.put('/feature-flags/:teamId', [privateMiddleware, validateBody('updateFeatureFlag'), validateTeamId], updateFeatureFlag); // update target
router.delete('/feature-flags/:teamId', [privateMiddleware, validateTeamId], deleteFeatureFlag);

module.exports = (app) => {
  app.use('/api/v1', router);

  app.get('/health', (req, res) => res.send({ status: 'OK' }));
  app.use('/public', express.static(path.resolve('public')));

  app.use(Sentry.Handlers.errorHandler());
  app.use(errorHandler);
};
