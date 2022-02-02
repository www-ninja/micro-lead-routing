const { v1: uuidv1 } = require('uuid');

module.exports = (req, res, next) => {
  if (!req.headers['ls-transaction-id']) req.headers['ls-transaction-id'] = uuidv1();
  return next();
};
