const { loggerWithPrefix } = require('leadrouting-common/libs');

const getErrorStatus = (err) => {
  if (err.response && err.response.status) {
    return err.response.status;
  }
  return err.status || 500;
};

const getErrorMessage = (err) => (err.response && err.response.data && err.response.data.errors ? err.response.data.errors.message : err.message);

/* eslint-disable consistent-return, no-unused-vars */
module.exports = (error, req, res, next) => {
  const errorStatus = getErrorStatus(error);
  const errorMessage = getErrorMessage(error);
  const errorLevel = parseInt(errorStatus, 10) < 500
    ? 'warn'
    : 'error';

  const logger = loggerWithPrefix(error.origin);
  logger[errorLevel](error);

  if (res.headersSent) return;

  return res
    .status(errorStatus)
    .json({ error: errorMessage });
};
