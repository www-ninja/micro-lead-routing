/**
 * Enriches agents with `pause_until_ts` field that contains timestamp the agent is paused until
 * @param {[{ kw_uid: number }]} agents
 * @param {[{ agent_kwuid: number, pause_until_ts: number }]} pausedAgents
 */
/* eslint-disable no-param-reassign */
const getPauseTimeValue = (pauseUntilTs) => {
  if (pauseUntilTs == null && typeof pauseUntilTs !== 'undefined') {
    return null;
  }

  if (!pauseUntilTs) {
    return 0;
  }

  return pauseUntilTs;
};

module.exports = (agents, pausedAgents) => {
  const agentsMap = pausedAgents.reduce((obj, pausedAgent) => {
    obj[pausedAgent.agent_kwuid] = pausedAgent.pause_until_ts;
    return obj;
  }, {});

  agents.forEach((agent) => {
    agent.pause_until_ts = getPauseTimeValue(agentsMap[agent.kw_uid]);
  });
};
