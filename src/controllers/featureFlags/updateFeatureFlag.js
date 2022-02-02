const { Serializer } = require('jsonapi-serializer');
const { loggerWithPrefix } = require('leadrouting-common/libs');
const { updateFeatureFlag } = require('../../services/feature-flag-services');
const { featureFlagTransformer } = require('../../transformers');
const { validateUserIds } = require('../../services');

const LOGGER_PREFIX = 'updateFeatureFlag::update =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

module.exports = async (req, res, next) => {
  try {
    const { body: { userIds }, params: { teamId } } = req;
    logger.info(`init: ${JSON.stringify({ teamId, userIds })}`);
    const isValidUserIds = await validateUserIds(userIds, teamId);
    if (!isValidUserIds) {
      res.status(400).json({ message: 'request has invalid userIds' });
      return logger.info(`failed: data with ${JSON.stringify({ teamId, userIds })} is have invalid userIds`);
    }

    const updated = await updateFeatureFlag(teamId, userIds);

    if (!updated) {
      res.status(200).json({ message: 'data updated' });
      return logger.info(`data not found: ${JSON.stringify({ teamId, userIds })}`);
    }

    const serializer = new Serializer('feature-flags', featureFlagTransformer(updated));

    res.status(200).json(serializer.serialize(updated));
    return logger.info(`success: ${JSON.stringify({ teamId, userIds })}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    return next(error);
  }
};
