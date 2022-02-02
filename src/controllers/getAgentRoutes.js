const { loggerWithPrefix } = require('leadrouting-common/libs');
const { agentRoutesTransformer } = require('../transformers');
const { getAgentRoutes } = require('../services/paused-agent-services');

const LOGGER_PREFIX = 'agentRoutes::fetch =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

module.exports = async (req, res, next) => {
  try {
    const {
      params: { agentId, teamId },
    } = req;
    logger.info(`init: ${JSON.stringify({ agentId, teamId })}`);

    const routes = await getAgentRoutes(agentId, teamId);
    const routeViews = agentRoutesTransformer(routes);

    res.status(200)
      .json({
        total: routeViews.length,
        data: routeViews,
      });
    return logger.info(`success: ${JSON.stringify({ routes })}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    return next(error);
  }
};
