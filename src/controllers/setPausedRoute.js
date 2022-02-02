/* eslint-disable camelcase */
const { Serializer } = require('jsonapi-serializer');
const { loggerWithPrefix } = require('leadrouting-common/libs');
const { getAgentById } = require('leadrouting-common/requests');
const { routePauseTransformer } = require('../transformers');
const { setPausedRoute } = require('../services/paused-agent-services');
const { postAuditMessage } = require('../services');

const LOGGER_PREFIX = 'routes::set::pause =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

module.exports = async (req, res, next) => {
  try {
    const {
      params: { teamId, agentId },
      body: { time, route_id },
    } = req;

    logger.info(`init: ${JSON.stringify({ agentId, teamId, route_id })}`);

    const paused = await setPausedRoute(agentId, parseInt(teamId, 10), time || null, route_id);
    const serializer = new Serializer('paused-agent-routes', routePauseTransformer(paused));

    try {
      const agentData = await getAgentById(agentId);

      const payload = {
        activity: {
          type: 'PAUSE LEAD ASSIGNMENT',
          sub_type: 'AGENT PAUSE',
          timestamp: process.env.NODE_ENV === 'test' ? '' : new Date().toISOString(),
          message: `${req.user.userFullName} has been pause ${agentData.first_name} ${agentData.last_name}'s lead`,
          more_info: `time: ${time}, route_id: ${route_id}`,
        },
      };
      await postAuditMessage(req, payload);
    } catch (error) {
      logger.info(error.message);
    }

    res
      .status(200)
      .json(serializer.serialize(paused));
    logger.info(`success: ${JSON.stringify({ serializer })}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    next(error);
  }
};
