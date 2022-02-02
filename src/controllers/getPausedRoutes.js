const { Serializer } = require('jsonapi-serializer');
const { loggerWithPrefix } = require('leadrouting-common/libs');
const { routePauseTransformer } = require('../transformers');
const { getPausedRoutes } = require('../services/paused-agent-services');

const LOGGER_PREFIX = 'routesPause::fetch =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

module.exports = async (req, res, next) => {
  try {
    const {
      params: { agentId, teamId },
    } = req;
    logger.info(`init: ${JSON.stringify({ agentId, teamId })}`);

    const routes = await getPausedRoutes(agentId, teamId);
    const serializer = new Serializer('paused-agent-routes', routePauseTransformer(routes));

    res
      .status(200)
      .json(serializer.serialize(routes));
    return logger.info(`success: ${JSON.stringify({ agentId })}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    return next(error);
  }
};
