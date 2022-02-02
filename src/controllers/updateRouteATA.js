const { Op: { ne } } = require('sequelize');
const { sequelize, loggerWithPrefix } = require('leadrouting-common/libs');
const {
  Routes,
  RouteSettings,
  RouteSource,
  RouteSchedule,
} = require('leadrouting-common/models');
const { getSources } = require('leadrouting-common/requests');
const initRouteSchedule = require('./../services/initRouteSchedule');
const { ROLES } = require('../enums');
const { postAuditMessage } = require('../services');

const LOGGER_PREFIX = 'route::update =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

/* eslint-disable camelcase */
module.exports = async (req, res, next) => {
  try {
    const {
      params: { routeId, teamId },
      headers: { authorization },
      body,
    } = req;
    logger.info(`init: ${JSON.stringify({ routeId, teamId, body })}`);

    let availableSources = [];
    let headers = { authorization };
    const { role } = req.user;
    if (role === ROLES.RAIN_MAKER) {
      headers = {
        authorization,
        'x-kwapp-roles': `{"${teamId}":"Team Leader (Rainmaker)"}`,
        'x-kwri-org': `${teamId}`,
      };
    }


    availableSources = await getSources(headers, req.body.sources);
    if (!availableSources.length) {
      const error = new Error();
      error.message = `No available sources were found for provided route payload: [{ sources: [${req.body.sources.join(
        ', ',
      )}] }]`;
      error.status = 409;

      throw error;
    }

    const isDuplicate = body.title && await Routes
      .findOne({ where: { id: { [ne]: routeId }, team_id: teamId, title: body.title } });

    if (isDuplicate) {
      const error = new Error();
      error.message = `Route "${body.title}" already exists`;
      error.status = 409;

      throw error;
    }

    const {
      title, disabled, settings: routeSettings,
    } = req.body;
    await sequelize.transaction(async (transaction) => {
      await Promise.all([
        RouteSchedule.destroy({
          transaction,
          where: { route_id: routeId },
        }),

        await RouteSchedule.bulkCreate(
          initRouteSchedule(
            routeSettings.active_days,
            routeSettings.active_from,
            routeSettings.active_until,
            routeSettings.timezone,
            routeId,
          ),
          { transaction },
        ),

        // eslint-disable-next-line max-len
        Routes.update({ title, disabled }, { where: { id: routeId }, transaction }),

        RouteSettings.update({ ...body.settings, route_id: routeId },
          { transaction, where: { route_id: routeId } }),

        RouteSource.destroy({ transaction, where: { route_id: routeId } }),
        RouteSource.bulkCreate(availableSources.map(({ id }) => ({
          source_id: id,
          route_id: routeId,
        })), { transaction }),
      ]);
    });

    res
      .status(204)
      .send();

    try {
      const payload = {
        activity: {
          type: 'ROUTE MANAGEMENT',
          sub_type: 'ROUTE EDIT',
          timestamp: new Date().toISOString(),
          message: `${req.user.userFullName} edited lead route - ${title}`,
          more_info: `userid: ${req.user.id}, route id: ${routeId}`,
        },
      };
      await postAuditMessage(req, payload);
    } catch (error) {
      logger.info(error.message);
    }
    return logger.info(`success: ${JSON.stringify({ routeId, teamId })}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    return next(error);
  }
};
