const { difference, get } = require('lodash');
const {
  Routes, RouteSettings, RouteAgent, RouteSource, RouteSchedule,
} = require('leadrouting-common/models');
const { sequelize, loggerWithPrefix } = require('leadrouting-common/libs');
const { getAgentsByOrgId, getSources } = require('leadrouting-common/requests');
const { isRR } = require('leadrouting-common/utils');
const initRouteSchedule = require('./../services/initRouteSchedule');
const { enrichRoutesWithAgents, enrichRoutesWithSources, postAuditMessage } = require('../services');
const { transformRoutes } = require('../transformers');

const LOGGER_PREFIX = 'routes::create =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

/* eslint-disable camelcase */
module.exports = async (req, res, next) => {
  try {
    const {
      params: { teamId },
      headers: { authorization },
      body,
    } = req;

    const payload = {
      title: body.title,
      team_id: body.team_id,
      creator_kwuid: body.creator_kwuid,
      disabled: body.disabled,
      deleted_at: null,
      is_all_sources: body.is_all_sources || false,
      notification_type: body.notification_type,
    };
    logger.info(`init: ${JSON.stringify(payload)}`);

    const routeAgentIds = req.body.agents.map(({ id }) => id);
    const teamAgents = await getAgentsByOrgId(req.user.id, teamId);
    const teamAgentIds = teamAgents.map(({ kw_uid }) => kw_uid);

    const unrecognizedAgentIds = difference(routeAgentIds, teamAgentIds);
    if (unrecognizedAgentIds.length) {
      const error = new Error();
      error.message = `Unrecognized agents were found in provided payload: [${unrecognizedAgentIds.join(', ')}].`;
      error.status = 409;

      throw error;
    }

    let availableSources = [];
    if (!body.is_all_sources) {
      const headers = {
        authorization,
        'x-kwapp-roles': `{"${teamId}":"Team Leader (Rainmaker)"}`,
        'x-kwri-org': `${teamId}`,
      };
      availableSources = await getSources(headers, req.body.sources);
      if (!availableSources.length) {
        const error = new Error();
        error.message = `No available sources were found for provided route payload: [{ sources: [${req.body.sources.join(
          ', ',
        )}] }]`;
        error.status = 409;

        throw error;
      }
    }

    let routeId;
    await sequelize.transaction(async (transaction) => {
      const [newRoute, isNewRoute] = await Routes.findOrCreate({
        where: {
          title: payload.title,
          team_id: teamId,
          is_all_sources: payload.is_all_sources,
        },
        defaults: {
          ...payload,
          id: undefined,
        },
        transaction,
      });
      routeId = newRoute.id;

      if (!isNewRoute) {
        const error = new Error();
        error.message = `Route "${payload.title}" already exists`;
        error.status = 409;

        throw error;
      }

      // TODO: rewrite it to model scope
      const routeWithMaxOrder = await Routes.scope({ method: ['withOrder', teamId] }).findOne();
      await newRoute.createOrder(
        {
          team_id: teamId,
          order: get(routeWithMaxOrder, 'order.order', 0) + 1,
        },
        { transaction },
      );

      const { settings: routeSettings } = req.body;
      await RouteSchedule.bulkCreate(
        initRouteSchedule(
          routeSettings.active_days,
          routeSettings.active_from,
          routeSettings.active_until,
          routeSettings.timezone,
          newRoute.id,
        ),
        { transaction },
      );
      await RouteSettings.create(
        {
          ...routeSettings,
          route_id: newRoute.id,
        },
        {
          transaction,
        },
      );

      const isRoundRobin = isRR(routeSettings.algorithm);

      const agentsPayload = req.body.agents.map((agent, index) => {
        const agentPayload = {
          agent_id: agent.id,
          weight: agent.weight,
          route_id: newRoute.id,
        };

        if (isRoundRobin) {
          agentPayload.order = agent.order || index + 1;
        }

        return agentPayload;
      });

      await RouteAgent.bulkCreate(agentsPayload, {
        transaction,
      });

      await RouteSource.bulkCreate(
        availableSources.map(({ id }) => ({
          source_id: id,
          route_id: newRoute.id,
        })),
        { transaction },
      );
    });

    const routeModel = await Routes.scope({ method: ['withOrder', teamId, false] }, 'fullData').findOne({
      where: { id: routeId },
    });
    const route = routeModel.get({ plain: true });

    // TODO: remove this functions, use RoutesModel.initFullData(agentsData, sourcesData)
    enrichRoutesWithAgents([route], teamAgents);
    enrichRoutesWithSources([route], availableSources);

    const [routeViews] = await transformRoutes([route]);

    res.status(200).json(routeViews);

    try {
      const auditPayload = {
        activity: {
          type: 'ROUTE MANAGEMENT',
          sub_type: 'ROUTE CREATE',
          timestamp: new Date().toISOString(),
          message: `${req.user.userFullName} created lead route - ${payload.title}`,
          more_info: `userid: ${req.user.id}, team id: ${teamId}, route id: ${routeId}`,
        },
      };
      await postAuditMessage(req, auditPayload);
    } catch (error) {
      logger.info(error.message);
    }

    return logger.info(`success: ${JSON.stringify(routeViews)}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    return next(error);
  }
};
