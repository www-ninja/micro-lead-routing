/**
 * According to `route_agents` field of each route enriches the route with array of `agent` objects
 * @param {[{ id: number, route_agents: [{ agent_id: number, weight: number }] }]} routes
 * @param {[{ kw_uid: number, first_name: string, last_name: string }]} agents
 * @param {string} [prop] - route_agents
 */
/* eslint-disable no-param-reassign */
module.exports = (routes, agents, prop = 'route_agents') => {
  if (!Array.isArray(routes) || !routes.length
    || !Array.isArray(agents) || !agents.length) return;

  const agentsMap = agents
    .reduce((map, agent) => map.set(parseFloat(agent.kw_uid), agent), new Map());

  routes.forEach((route) => {
    route[prop] = route.route_agents
      .reduce((arr, { agent_id: id, weight, order }) => (agentsMap.get(id)
        ? [...arr, { ...agentsMap.get(id), weight, order }]
        : arr),
      []);
  });
};
