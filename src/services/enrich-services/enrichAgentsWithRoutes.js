/**
 * Enriches agents with `routes` field that contains routes the agent participates in
 * @param {[{ kw_uid: number, }]} agents
 * @param {[{ id: number, route_agents: [{ agent_id: number ]} }]} routes
 */
/* eslint-disable no-param-reassign */
module.exports = (agents, routes) => {
  const agentRouteMap = agents.reduce((map, agent) => map.set(agent.kw_uid,
    routes.filter((route) => route.route_agents
      .find((meta) => meta.agent_id === agent.kw_uid))),
  new Map());

  agents.forEach((agent) => {
    agent.routes = agentRouteMap.get(agent.kw_uid);
  });
};
