const { PausedAgent } = require('leadrouting-common/models');

module.exports = async (agentId, teamId, untilTs) => {
  const [paused] = await PausedAgent.findOrCreate({
    where: { agent_kwuid: agentId, team_id: teamId, route_id: null },
    defaults: {
      agent_kwuid: agentId,
      pause_until_ts: untilTs,
      team_id: teamId,
      route_id: null,
    },
  });

  await paused.update({ pause_until_ts: untilTs });

  return paused.get({ plain: true });
};
