const { loggerWithPrefix } = require('leadrouting-common/libs');
const { getAgentStatistic, getAgentsByOrgId } = require('leadrouting-common/requests');
const moment = require('moment');
const { errorHandler, enrichAgentsWithLeadsMeta } = require('../services');
const { agentStatsTransformer } = require('../transformers');
const { ROLES } = require('../enums');

const LOGGER_PREFIX = 'routes::fetch =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

/* eslint-disable no-confusing-arrow */
module.exports = async (req, res, next) => {
  try {
    const startOfMonth = moment().startOf('month').toISOString();
    const endOfMonth = moment().endOf('month').toISOString();
    const {
      params: { teamId, agentId },
      headers: { authorization },
      query: { startDate = startOfMonth, endDate = endOfMonth },
    } = req;

    logger.info(`init: ${JSON.stringify({ teamId, agentId })}`);

    const agentKWUID = req.user.id;

    if (+agentId !== +agentKWUID && req.user.role !== ROLES.RAIN_MAKER) {
      const error = errorHandler('Action not allowed!', 403);
      throw error;
    }

    const agents = await getAgentsByOrgId(agentKWUID, teamId);

    if (!agents.length) {
      const error = errorHandler('Team does not have any agent.', 403);
      throw error;
    }

    const agentOnTeam = agents.find(
      (agent) => agent.kw_uid.toString() === agentId.toString(),
    );
    if (!agentOnTeam) {
      const error = errorHandler('This agent does not exist on the team', 403);
      throw error;
    }

    const teamStatistic = await getAgentStatistic({ authorization, agentId }, teamId, `startDate=${startDate}&endDate=${endDate}`);

    enrichAgentsWithLeadsMeta([agentOnTeam], teamStatistic);

    res
      .status(200)
      .json(agentStatsTransformer(agentOnTeam));
    return logger.info(`success: ${JSON.stringify(agentOnTeam)}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    return next(error);
  }
};
