/* eslint-disable camelcase */
const { Serializer } = require('jsonapi-serializer');
const { loggerWithPrefix } = require('leadrouting-common/libs');
const { createFeatureFlag } = require('../../services/feature-flag-services');
const { featureFlagTransformer } = require('../../transformers');
const { validateUserIds } = require('../../services');

const LOGGER_PREFIX = 'createFeatureFlag::create =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

module.exports = async (req, res, next) => {
  const { body: { userIds }, params: { teamId } } = req;
  try {
    logger.info(`init: ${JSON.stringify({ teamId, userIds })}`);
    const data = await createFeatureFlag({ teamId, userIds });

    const isValidUserIds = await validateUserIds(userIds, teamId);
    if (!isValidUserIds) {
      res.status(400).json({ message: 'request has invalid userIds' });
      return logger.info(`failed: data with ${JSON.stringify({ teamId, userIds })} is have invalid userIds`);
    }

    if (!data) {
      res.status(400).json({ message: `data with teamId ${teamId} is already exists` });
      return logger.info(`failed: data with ${JSON.stringify({ teamId, userIds })} is already exists`);
    }

    const serializer = new Serializer('feature_flags', featureFlagTransformer(data));
    res.status(200).json(serializer.serialize(data));
    return logger.info(`success: ${JSON.stringify({ teamId, userIds })}`);
  } catch (err) {
    err.origin = `${LOGGER_PREFIX} failure`;
    return next(err);
  }
};
