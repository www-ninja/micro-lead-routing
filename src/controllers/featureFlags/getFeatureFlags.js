const { Serializer } = require('jsonapi-serializer');
const { loggerWithPrefix } = require('leadrouting-common/libs');
const { getFeatureFlags } = require('../../services');
const featureFlagsTransformer = require('../../transformers/featureFlagsTransformer');

const LOGGER_PREFIX = 'getFeatureFlags::fetch =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

module.exports = async (req, res, next) => {
  try {
    const { query: { offset, limit } } = req;
    const data = await getFeatureFlags({ offset, limit });

    logger.info(`init: ${JSON.stringify({ offset, limit })}`);

    const serializer = new Serializer('feature_flags', featureFlagsTransformer(data));
    res.status(200).json(serializer.serialize(data));
    return logger.info(`success: ${JSON.stringify({ offset, limit })}`);
  } catch (err) {
    err.origin = `${LOGGER_PREFIX} failure`;
    return next(err);
  }
};
