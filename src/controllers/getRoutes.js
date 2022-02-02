const {
  Routes, RouteSource, RouteSettings, RouteAgent,
} = require('leadrouting-common/models');
const { getAgentsByOrgId, getSources } = require('leadrouting-common/requests');
const { loggerWithPrefix } = require('leadrouting-common/libs');
const { isEmpty } = require('lodash');
const {
  getQueryParams,
  getSourceIdsByRoutes,
} = require('../services');
const { ROLES } = require('../enums');

const LOGGER_PREFIX = 'routes::fetch =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

module.exports = async (req, res, next) => {
  try {
    const { headers: { authorization }, params: { teamId } } = req;
    logger.info(`init: ${JSON.stringify({ teamId })}`);
    const { offset, limit, where } = getQueryParams(req);

    const routeModels = await Routes
      .scope({ method: ['withOrder', teamId, false] })
      .findAll({
        offset,
        limit,
        include: [
          {
            model: RouteSource,
            attributes: ['route_id', 'source_id'],
            required: !isEmpty(where),
            where,
          },
          RouteSettings, RouteAgent,
        ],
        order: [
          [RouteSource, 'source_id', 'asc'],
        ],
      });

    if (!routeModels.length) {
      return res.json({
        data: [],
        total: 0,
      });
    }

    const routes = routeModels.map((model) => model.get({ plain: true }));
    const idsOfSources = getSourceIdsByRoutes(routes);

    // TODO: think about parallel requests to remote server
    /* eslint-disable no-param-reassign */
    let sources = [];
    logger.info(`sources::fetch => start ${JSON.stringify({ payload: idsOfSources })}`);

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
          const sourceObj = { label: source.label ? source.label.display : source };
          obj[source.id] = sourceObj;
          return obj;
        }, {});
    }

    const agents = (await getAgentsByOrgId(req.user.id, teamId))
      .reduce((obj, agent) => {
        obj[agent.kw_uid] = agent;
        return obj;
      }, {});

    const routeViews = routeModels.map((route) => route.initFullData(agents, sources));

    res.json({
      data: routeViews,
      total: routeViews.length,
    });
    logger.info(`sources::fetch => success: ${JSON.stringify(sources)}`);
    return logger.info(`success: ${JSON.stringify(routeViews)}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    return next(error);
  }
};
