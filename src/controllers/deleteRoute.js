const {
  Routes, RouteOrder, RouteAgent, RouteSchedule, RouteSettings, RouteSource,
} = require('leadrouting-common/models');
const { loggerWithPrefix } = require('leadrouting-common/libs');
const { postAuditMessage } = require('../services');

const LOGGER_PREFIX = 'routes::delete =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

module.exports = async (req, res, next) => {
  try {
    const { params: { teamId, routeId } } = req;
    logger.info(`init: ${JSON.stringify({ teamId, routeId })}`);
    const route = await Routes.findOne({
      where: {
        id: routeId,
        team_id: teamId,
      },
    });

    if (route) {
      await route.update({
        disabled: true,
      });

      // if disabled is FALSE, destory RouteOrder first
    }

    let payload = {};
    if (req.get('x-api-permanent-delete') === '1') {
      logger.info(`permanent delete: ${JSON.stringify({ routeId })}`);
      await RouteAgent.destroy({ where: { route_id: routeId }, force: true });
      await RouteSchedule.destroy({ where: { route_id: routeId }, force: true });
      await RouteSettings.destroy({ where: { route_id: routeId }, force: true });
      await RouteSource.destroy({ where: { route_id: routeId }, force: true });
      await RouteOrder.destroy({ where: { route_id: routeId }, force: true });
      await Routes.destroy({ where: { id: routeId, team_id: teamId }, force: true });

      payload = {
        activity: {
          type: 'ROUTE MANAGEMENT',
          sub_type: 'ROUTE DELETE',
          timestamp: new Date().toISOString(),
          message: `${req.user.userFullName} deleted lead route - ${route.title}`,
          more_info: `userid: ${req.user.id}, route id: ${routeId}`,
        },
      };
    } else {
      logger.info(`soft delete: ${JSON.stringify({ routeId })}`);
      await Routes.destroy({ where: { id: routeId, team_id: teamId } });
      payload = {
        activity: {
          type: 'ROUTE MANAGEMENT',
          sub_type: 'ROUTE ARCHIVE',
          timestamp: new Date().toISOString(),
          message: `${req.user.userFullName} archived lead route - ${route.title}`,
          more_info: `userid: ${req.user.id}, route id: ${routeId}`,
        },
      };
    }

    res
      .status(202)
      .send();

    try {
      await postAuditMessage(req, payload);
    } catch (error) {
      logger.info(error.message);
    }
    return logger.info(`success: ${JSON.stringify({ teamId, routeId })}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    return next(error);
  }
};
