const { Op } = require('sequelize');
const { loggerWithPrefix } = require('leadrouting-common/libs');
const { orderBy } = require('lodash');

const LOGGER_PREFIX = 'route::update::order =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

const {
  RouteOrder,
  Routes,
} = require('leadrouting-common/models');

module.exports = async (req, res, next) => {
  try {
    const { body: { routes }, params: { teamId } } = req;
    logger.info(`init: routes ${JSON.stringify(routes)} teamId ${JSON.stringify(teamId)}`);

    const validRouteIds = await Routes.findAll({
      attributes: ['id'],
      where: {
        id: {
          [Op.in]: routes.map((route) => route.route_id),
        },
        team_id: teamId,
      },
    }).map((route) => route.get('id'));
    logger.info(`info: validRouteIds ${JSON.stringify(validRouteIds)}`);

    await RouteOrder.destroy({
      where: {
        route_id: {
          [Op.in]: validRouteIds,
        },
      },
    });

    const newRoutesOrder = await RouteOrder.bulkCreate(routes.map((route) => ({
      ...route,
      team_id: teamId,
    })));
    logger.info(`info: newRoutesOrder ${JSON.stringify(newRoutesOrder)}`);

    const routesOrderForResponse = orderBy(
      newRoutesOrder.map((routeOrder) => ({
        route_id: routeOrder.get('route_id'),
        order: routeOrder.get('order'),
      })),
      ['order'],
      ['desc'],
    );

    res
      .status(200)
      .send(routesOrderForResponse);
    return logger.info(`success: ${JSON.stringify(routesOrderForResponse)}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    return next(error);
  }
};
