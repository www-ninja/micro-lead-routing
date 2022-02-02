const { Op } = require('sequelize');
const { Routes, PausedAgent } = require('leadrouting-common/models');
const { loggerWithPrefix } = require('leadrouting-common/libs');
const {
  getAgentsByOrgId, getSources, getTeamStatistic,
} = require('leadrouting-common/requests');
const moment = require('moment');
const {
  getSourceIdsByRoutes,
  enrichAgentsWithRoutes,
  enrichRoutesWithSources,
  enrichAgentWithPause,
  enrichWithTeamStats,
  enrichAgentsWithLeadsMeta,
} = require('../services');
const { agentsTransformer } = require('../transformers');

const LOGGER_PREFIX = 'agents::fetch =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

/* eslint-disable no-confusing-arrow */
module.exports = async (req, res, next) => {
  try {
    const startOfMonth = moment().startOf('month').toISOString();
    const endOfMonth = moment().endOf('month').toISOString();
    const {
      headers: { authorization },
      params: { teamId },
      query: { include = '', startDate = startOfMonth, endDate = endOfMonth },
    } = req;
    logger.info(`init: ${JSON.stringify({ teamId })}`);
    const agents = await getAgentsByOrgId(req.user.id, teamId);

    const teamStatistic = await getTeamStatistic({ token: authorization, agentId: null }, teamId, `startDate=${startDate}&endDate=${endDate}`);

    if (!agents.length || !teamStatistic) {
      return res
        .status(200)
        .json(agentsTransformer(agents));
    }

    const teamStats = enrichWithTeamStats(teamId, teamStatistic);
    enrichAgentsWithLeadsMeta(agents, teamStatistic);

    if (include.includes('routes')) {
      const routeModels = await Routes
        .scope({ method: ['withOrder', teamId, false] }, 'fullData')
        .findAll({
          where: {
            disabled: false,
          },
        });
      const routes = routeModels.map((model) => model.get({ plain: true }));

      enrichAgentsWithRoutes(agents, routes);

      const idsOfSources = getSourceIdsByRoutes(routes);

      const headers = {
        authorization,
        'x-kwapp-roles': `{"${teamId}":"Team Leader (Rainmaker)"}`,
        'x-kwri-org': `${teamId}`,
      };

      const sources = await getSources(headers, idsOfSources);

      enrichRoutesWithSources(routes, sources);
    }

    if (include.includes('pause')) {
      const pausedAgents = await PausedAgent.findAll({
        where: {
          team_id: teamId,
          agent_kwuid: {
            [Op.in]: agents.map((agent) => agent.kw_uid),
          },
          pause_until_ts: {
            [Op.or]: {
              [Op.eq]: null,
              [Op.gte]: moment().unix(),
            },
          },
          route_id: null,
        },
      });

      enrichAgentWithPause(agents, pausedAgents);
    }

    res
      .status(200)
      .json(agentsTransformer(agents, teamStats));
    return logger.info(`success: ${JSON.stringify(agents)}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    return next(error);
  }
};
