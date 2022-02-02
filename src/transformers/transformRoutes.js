const { get } = require('lodash');

/* eslint-disable no-confusing-arrow */
module.exports = (routes) => routes.map((route) => ({
  type: 'routes',
  id: route.id,
  attributes: {
    title: route.title,
    disabled: route.disabled,
    creator_kwuid: route.creator_kwuid,
    team_id: route.team_id,
    created_at: route.created_at,
    updated_at: route.updated_at,
    deleted_at: route.deleted_at,
    order: get(route, 'order.order', null),
    settings: route.route_setting,
    agents: route.route_agents.map((agent) => ({
      type: 'agents',
      id: agent.kw_uid.toString(),
      attributes: {
        ...agent,
        id: agent.kw_uid,
        kw_uid: undefined,
      },
    })),
    sources: route.route_sources.map((source) => ({ id: source.id, label: source.label })),
    is_all_sources: route.is_all_sources,
    notification_type: route.notification_type,
  },
}));
