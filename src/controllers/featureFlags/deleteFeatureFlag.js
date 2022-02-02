const { loggerWithPrefix } = require('leadrouting-common/libs');
const { deleteFeatureFlag } = require('../../services');

const LOGGER_PREFIX = 'deleteFeatureFlag::delete =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

module.exports = async (req, res, next) => {
  const {
    params: { teamId },
  } = req;

  try {
    await deleteFeatureFlag({ teamId });

    res.status(202).json({ message: 'data deleted' });
    return logger.info(`success: ${JSON.stringify({ teamId })}`);
  } catch (err) {
    err.origin = `${LOGGER_PREFIX} failure`;
    logger.info(`failed: ${JSON.stringify({ teamId })}`);
    return next(err);
  }
};
