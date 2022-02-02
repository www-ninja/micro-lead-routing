const {
  get, assign, uniq,
} = require('lodash');
const { Routes } = require('leadrouting-common/models');
const { isATA } = require('leadrouting-common/utils');
const { ROLES } = require('../enums');

module.exports = async (req, res, next) => {
  try {
    const {
      params: { routeId, teamId },
      body,
    } = req;

    if (body.is_all_sources) {
      const error = new Error();
      error.message = "[is_all_sources] can't be True";
      error.status = 409;
      return next(error);
    }

    const { role } = req.user;

    if (role === ROLES.NOT_MEMBER) {
      const error = new Error();
      error.message = `You are not a member of team with ID ${teamId}`;
      error.status = 409;

      return next(error);
    }
    if (role === ROLES.UNKNOWN) {
      const error = new Error();
      error.message = 'Internal Server error';
      error.status = 409;

      return next(error);
    }

    const route = await Routes.scope('fullData').findOne({
      where: {
        id: routeId,
        team_id: teamId,
      },
    });
    const {
      // eslint-disable-next-line camelcase
      active_days, active_from, active_until, timezone,
    } = route.route_setting;
    const oldRouteSetting = {
      active_days,
      active_from,
      active_until,
      timezone,
    };
    req.body.settings = assign(oldRouteSetting, req.body.settings);
    // eslint-disable-next-line camelcase
    const newSources = get(req, 'body.sources', []);
    req.body.sources = uniq(newSources);
    const isATARoute = isATA(get(route, 'route_setting.algorithm'));
    if (!isATARoute) {
      const error = new Error();
      error.message = 'The route is not ATA';
      error.status = 422;
      throw error;
    }
    if (get(req, 'body.settings.rerouting_delay', null) !== null) {
      req.body.settings.rerouting_delay = 31535999;
    }
    const userId = req.user.id;

    const isOwnRoute = route && route.route_agents.findIndex((agent) => agent.agent_id === parseInt(userId, 10)) !== -1;

    if (!isOwnRoute) {
      const error = new Error();
      error.message = "You don't have permission for this Route";
      error.status = 409;
      return next(error);
    }

    res.locals = { userId };

    return next();
  } catch (error) {
    return next(error);
  }
};
