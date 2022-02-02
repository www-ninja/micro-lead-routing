const { ajv } = require('../libs');

module.exports = (schema) => async (req, res, next) => {
  try {
    const isPayloadValid = ajv.validate(schema, req.body);

    return isPayloadValid
      ? next()
      : res.status(400).json({
        type: 'routes',
        error: 'validation_error',
        error_description: ajv.errorsText(),
      });
  } catch (error) {
    return next(error);
  }
};
