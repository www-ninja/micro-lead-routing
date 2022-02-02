const { PausedAgent } = require('leadrouting-common/models');
const moment = require('moment');
const { Op } = require('sequelize');

/**
 * Returns paused agent routes for the agent.
 * With `pause_until_ts` field that contains timestamp the agent is paused until
 * or `pause_until_ts` null if paused forever.
 *
 * @param {[{ teamId: number }]}
 */
module.exports = async (agentId, teamId) => PausedAgent.findAll({
  attributes: ['pause_until_ts', 'agent_kwuid', 'route_id'],
  where: {
    agent_kwuid: agentId,
    team_id: teamId,
    route_id: {
      [Op.not]: null,
    },
    [Op.or]: [
      {
        pause_until_ts: null,
      },
      {
        pause_until_ts: {
          [Op.gte]: moment().unix(),
        },
      },
    ],
  },
});
