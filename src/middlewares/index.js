const validateParams = require('./validateParams');
const validateBody = require('./validateBody');
const validateRainmaker = require('./validateRainmaker');
const updateRouteATA = require('./updateRouteATA');
const errorHandler = require('./errorHandler');
const validateUuid = require('./validateUuid');
const createRouteMiddleware = require('./createRoute');
const validateTeam = require('./validateTeam');
const claimPassLead = require('./claimPassLead');
const authentication = require('./authentication');
const privateMiddleware = require('./privateMiddleware');
const validateTeamId = require('./validateTeamId');

module.exports = {
  authentication,
  validateParams,
  validateBody,
  validateRainmaker,
  errorHandler,
  validateUuid,
  createRouteMiddleware,
  updateRouteATA,
  validateTeam,
  claimPassLead,
  privateMiddleware,
  validateTeamId,
};
