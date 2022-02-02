/* eslint-disable no-param-reassign */
const { loggerWithPrefix } = require('leadrouting-common/libs');
const { getAgentsByOrgId, getSources } = require('leadrouting-common/requests');
const { Routes } = require('leadrouting-common/models');
const {
  getSourceIdsByRoutes,
} = require('../services');
const { ROLES } = require('../enums');
const { postAuditMessage } = require('../services');

const LOGGER_PREFIX = 'route::update::disabled =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

module.exports = async (req, res, next) => {
  try {
    const { headers: { authorization }, params: { teamId, routeId } } = req;
    logger.info(`init: ${JSON.stringify({ teamId, routeId })}`);

    let route = await Routes.findOne({
      where: {
        id: routeId,
        team_id: teamId,
      },
      paranoid: false,
    });

    if (!route) {
      const error = new Error();
      error.message = 'Route not found';
      error.status = 404;

      throw error;
    }

    await route.update({
      disabled: false,
    });

    await route.restore();

    const routeModel = await Routes.scope({ method: ['withOrder', teamId, false] }, 'fullData').findOne({
      where: { id: routeId },
    });
    route = routeModel.get({ plain: true });

    const idsOfSources = getSourceIdsByRoutes([route]);

    let sources = [];

    if (idsOfSources.length) {
      let headers = { authorization };
      const { role } = req.user;
      if (role === ROLES.RAIN_MAKER) {
        headers = {
          authorization,
          'x-kwapp-roles': `{"${teamId}":"Team Leader (Rainmaker)"}`,
          'x-kwri-org': `${teamId}`,
        };
      }

      sources = (await getSources(headers, idsOfSources))
        .reduce((obj, source) => {
          obj[source.id] = source;
          return obj;
        }, {});
    }

    const agents = (await getAgentsByOrgId(req.user.id, teamId))
      .reduce((obj, agent) => {
        obj[agent.kw_uid] = agent;
        return obj;
      }, {});

    const routeView = routeModel.initFullData(agents, sources);

    res
      .status(200)
      .send(routeView);

    try {
      const payload = {
        activity: {
          type: 'ROUTE MANAGEMENT',
          sub_type: 'ROUTE RESTORE',
          timestamp: new Date().toISOString(),
          message: `${req.user.userFullName} restored lead route - ${route.title}`,
          more_info: `userid: ${req.user.id}, route id: ${routeId}`,
        },
      };
      await postAuditMessage(req, payload);
    } catch (error) {
      logger.info(error.message);
    }
    return logger.info(`success: ${JSON.stringify(routeView)}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    return next(error);
  }
};
