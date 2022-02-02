const { ajv } = require('../libs');

module.exports = (schema) => async (req, res, next) => {
  try {
    const isPayloadValid = ajv.validate(schema, req.params);
    return isPayloadValid
      ? next()
      : res.status(400).json({
        error: 'Bad Request',
        message: 'teamId or agentId params field is missing - the field is required.',
      });
  } catch (error) {
    return next(error);
  }
};
