/**
 * According to `route_sources` field of each route enriches the route with array of sources
 * @param {[{ id: number, route_sources: [{ source_id: number, route_id: number }] }]} routes
 * @param {[{ id: string, label: string }]} sources
 * @param {string} [prop] - route_agents
 */
/* eslint-disable no-param-reassign */
module.exports = (routes, sources, prop = 'route_sources') => {
  if (!Array.isArray(routes) || !routes.length
    || !Array.isArray(sources) || !sources.length) return;

  const sourcesMap = sources
    .reduce((map, source) => map.set(parseFloat(source.id), source), new Map());

  routes.forEach((route) => {
    route[prop] = route.route_sources
      .reduce((arr, { source_id: id }) => (sourcesMap.get(id)
        ? [...arr, sourcesMap.get(id)]
        : arr),
      []);
  });
};
