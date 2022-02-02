const { Serializer } = require('jsonapi-serializer');
const { loggerWithPrefix } = require('leadrouting-common/libs');
const { getAgentById } = require('leadrouting-common/requests');
const { agentPauseTransformer } = require('../transformers');
const { setPausedAgent } = require('../services/paused-agent-services');
const { postAuditMessage } = require('../services');

const LOGGER_PREFIX = 'agents::set::pause =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

module.exports = async (req, res, next) => {
  try {
    const {
      params: { teamId, agentId },
      body: { time },
    } = req;

    logger.info(`init: ${JSON.stringify({ agentId, teamId })}`);

    try {
      const agentData = await getAgentById(agentId);

      const payload = {
        activity: {
          type: 'PAUSE LEAD ASSIGNMENT',
          sub_type: 'AGENT PAUSE',
          timestamp: process.env.NODE_ENV === 'test' ? '' : new Date().toISOString(),
          message: `${req.user.userFullName} has been pause ${agentData.first_name} ${agentData.last_name}'s lead`,
          more_info: `time: ${time}`,
        },
      };

      await postAuditMessage(req, payload);
    } catch (error) {
      logger.info(error.message);
    }

    const paused = await setPausedAgent(agentId, parseInt(teamId, 10), time || null);

    const serializer = new Serializer('paused-agents', agentPauseTransformer(paused));

    res
      .status(200)
      .json(serializer.serialize(paused));
    logger.info(`success: ${JSON.stringify({ serializer })}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    next(error);
  }
};
