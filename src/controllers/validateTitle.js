const { Routes } = require('leadrouting-common/models');
const { loggerWithPrefix } = require('leadrouting-common/libs');
const { Op: { ne } } = require('sequelize');

const LOGGER_PREFIX = 'route::title::validate =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

module.exports = async (req, res, next) => {
  try {
    const { body, params: { teamId, routeId } } = req;
    logger.info(`init: ${JSON.stringify({ title: body.title, routeId })}`);
    const isDuplicate = body.title && await Routes
      .findOne({ where: { id: { [ne]: routeId }, team_id: teamId, title: body.title } });

    if (isDuplicate) {
      // Custom error message was formed due to meaning of validation endpoint.
      // There is no any of client errors that occur in any result of payload validation
      // because there is no mutations ment to be performed.
      const error = new Error();
      error.status = 409;
      error.message = `Route ${body.title} already exists`;
      logger.warn(error);
      return res.json({
        errors: [{
          detail: error.message,
          status: error.status,
        }],
      });
    }

    res
      .status(200)
      .json({ data: null });
    return logger.info(`success: ${JSON.stringify({ title: body.title, routeId })}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    return next(error);
  }
};
