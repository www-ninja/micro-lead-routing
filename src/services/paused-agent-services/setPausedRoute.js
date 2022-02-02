const { PausedAgent } = require('leadrouting-common/models');

module.exports = async (agentId, teamId, untilTs, routeId) => {
  const [paused] = await PausedAgent.findOrCreate({
    where: { agent_kwuid: agentId, team_id: teamId, route_id: routeId },
    defaults: {
      agent_kwuid: agentId,
      pause_until_ts: untilTs,
      team_id: teamId,
      route_id: routeId,
    },
  });

  await paused.update({ pause_until_ts: untilTs });

  return paused.get({ plain: true });
};
