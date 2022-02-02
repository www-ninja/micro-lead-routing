const { getContactsFromLeadpool } = require('leadrouting-common/requests');
const { loggerWithPrefix } = require('leadrouting-common/libs');
const teamHeader = require('../util/teamHeader');
const { encodeToBase64 } = require('../util/base64');
const { ROLES } = require('../enums');

const LOGGER_PREFIX = 'leads::pooled =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

module.exports = async (request, response, next) => {
  try {
    const {
      headers,
      params: { teamId },
      user: { role },
    } = request;
    const userId = await request.user.id;
    logger.info(`userId: ${userId}`);

    if (role === ROLES.NOT_MEMBER || role === ROLES.UNKNOWN) {
      const err = {
        ...(new Error()),
        status: 403,
        message: 'You are not a team member',
      };
      return next(err);
    }

    teamHeader(headers, teamId, role);

    const flags = {
      version: 1,
      onlyArchived: false,
      withArchived: false,
      onlyLeadPool: true,
      onlyLeadRoute: false,
    };

    const {
      meta: {
        total: pooledLeadsCount,
      },
    } = await getContactsFromLeadpool(headers, encodeToBase64({ filter: [] }, flags));
    logger.info(`pooled leads: ${pooledLeadsCount}`);

    return response
      .status(200)
      .send({ data: { count: pooledLeadsCount } });
  } catch (error) {
    return next(error);
  }
};
