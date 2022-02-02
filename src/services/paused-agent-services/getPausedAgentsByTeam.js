const { PausedAgent } = require('leadrouting-common/models');
const moment = require('moment');
const { Op } = require('sequelize');

/**
 * Returns paused agents for the team.
 * With `pause_until_ts` field that contains timestamp the agent is paused until
 * or `pause_until_ts` null if paused forever.
 *
 * @param {[{ teamId: number }]}
 */
module.exports = async (teamId) => PausedAgent.findOne({
  attributes: ['agent_kwuid'],
  where: {
    team_id: teamId,
    route_id: null,
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
