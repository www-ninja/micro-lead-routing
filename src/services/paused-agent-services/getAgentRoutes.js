const { get } = require('lodash');
const { RouteAgent, Routes } = require('leadrouting-common/models');
const { Op } = require('sequelize');

/**
 * Returns all routes for specific agentId on a team.
 *
 * @param {[{ agentId: number, teamId: number }]}
 */
module.exports = async (agentId, teamId) => {
  const agentRoutes = await RouteAgent.findAll({
    attributes: ['route_id'],
    where: {
      agent_id: agentId,
    },
  });

  const agentRoutesIds = agentRoutes.map((agentRoute) => get(agentRoute, 'route_id'));

  const routes = await Routes.findAll({
    where: {
      id: { [Op.in]: agentRoutesIds },
      team_id: teamId,
      disabled: false,
      deleted_at: null,
    },
  });

  return routes;
};
