const appConfig = require('../../config/config');

const isFeatureFlag = (headers) => headers['x-api-feature-flag'] === '1';
const isValidApiKey = (headers) => headers['x-api-key'] && headers['x-api-key'] === appConfig.apiKey;

module.exports = (req, res, next) => {
  if (!isValidApiKey(req.headers) || !isFeatureFlag(req.headers)) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authorization',
    });
  }
  return next();
};
