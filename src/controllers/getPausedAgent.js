const { Serializer } = require('jsonapi-serializer');
const { loggerWithPrefix } = require('leadrouting-common/libs');
const { agentPauseTransformer } = require('../transformers');
const { getPausedAgent } = require('../services/paused-agent-services');

const LOGGER_PREFIX = 'agentPause::fetch =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

module.exports = async (req, res, next) => {
  try {
    const {
      params: { agentId, teamId },
    } = req;

    logger.info(`init: ${JSON.stringify({ agentId, teamId })}`);

    const paused = await getPausedAgent(agentId, teamId);
    const serializer = new Serializer('paused-agents', agentPauseTransformer(paused));

    res
      .status(200)
      .json(serializer.serialize(paused));
    return logger.info(`success: ${JSON.stringify({ agentId })}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    return next(error);
  }
};
