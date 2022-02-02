/**
 * Returns array of ids of provided routes sources
 *
 * @param {[{ id: number, route_sources: [{ source_id: number, route_id: number }] }]} routes
 * @returns {[number]} Ids of sources of provided routes
 */
module.exports = (routes) => {
  if (!routes.length) return [];

  const setOfIds = routes.reduce((set, route) => {
    route.route_sources.forEach((routeSource) => set.add(routeSource.source_id));
    return set;
  }, new Set());

  return Array.from(setOfIds);
};
