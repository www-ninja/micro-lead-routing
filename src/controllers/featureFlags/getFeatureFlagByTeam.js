const { Serializer } = require('jsonapi-serializer');
const { loggerWithPrefix } = require('leadrouting-common/libs');
const { getFeatureFlagByTeam } = require('../../services');
const featureFlagTransformer = require('../../transformers/featureFlagsTransformer');

const LOGGER_PREFIX = 'getFeatureFlagByTeam::fetch => ';
const logger = loggerWithPrefix(LOGGER_PREFIX);

module.exports = async (req, res, next) => {
  try {
    const {
      body: {
        offset,
        limit,
        userIds,
      },
      params: { teamId },
    } = req;
    const data = await getFeatureFlagByTeam({
      teamId, offset, limit, userIds,
    });
    logger.info(`init:${JSON.stringify({
      teamId, offset, limit, userIds,
    })}`);

    const serializer = new Serializer('feature_flags', featureFlagTransformer(data));

    res.status(200).send(serializer.serialize(data));
    return logger.info(`success: ${JSON.stringify({ teamId, offset, limit })}`);
  } catch (error) {
    error.source = 'LOGGER_PREFIX';
    return next(error);
  }
};
