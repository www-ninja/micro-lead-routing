const { get } = require('lodash');
const { loggerWithPrefix } = require('leadrouting-common/libs');
const { Routes, RouteOrder } = require('leadrouting-common/models');
const { postAuditMessage } = require('../services');

const LOGGER_PREFIX = 'route::update::disabled =>';
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

    if (!route) {
      const error = new Error();
      error.message = 'Route not found';
      error.status = 404;

      throw error;
    }

    const valueToSave = !route.get('disabled');

    await route.update({
      disabled: valueToSave,
    });

    if (valueToSave) {
      await RouteOrder.destroy({ where: { route_id: routeId } });
    } else {
      // TODO: rewrite it to model scope
      const routeWithMaxOrder = await Routes
        .scope({ method: ['withOrder', teamId] })
        .findOne();

      await route.createOrder({
        team_id: teamId,
        order: get(routeWithMaxOrder, 'order.order', 0) + 1,
      });
    }

    res
      .status(200)
      .send(route);

    try {
      const payload = {
        activity: {
          type: 'ROUTE MANAGEMENT',
          sub_type: valueToSave ? 'ROUTE PAUSE' : 'ROUTE RESUME',
          timestamp: new Date().toISOString(),
          message: `${req.user.userFullName} ${valueToSave ? 'paused' : 'resumed'} lead route - ${route.title}`,
          more_info: `userid: ${req.user.id}, route id: ${routeId}`,
        },
      };
      await postAuditMessage(req, payload);
    } catch (error) {
      logger.info(error.message);
    }

    return logger.info(`success: ${JSON.stringify(route)}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    return next(error);
  }
};
