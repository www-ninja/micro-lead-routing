module.exports = (routes) => routes.map((route) => ({
  type: 'routes',
  id: route.id,
  attributes: {
    title: route.title,
    team_id: route.team_id,
    created_at: route.created_at,
    updated_at: route.updated_at,
  },
}));
