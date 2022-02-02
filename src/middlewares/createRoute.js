const { get, uniqBy, filter } = require('lodash');
const { ALGORITHMS } = require('leadrouting-common/enums');
const { isATA, isRR, isWRR } = require('leadrouting-common/utils');

module.exports = async (req, res, next) => {
  try {
    if (isATA(get(req.body, 'settings.algorithm'))) {
      if (get(req.body, 'agents', []).length !== 1) {
        const error = new Error();
        error.message = `Route with [${ALGORITHMS.ATA}] Algorithm should contain only one Agent.`;
        error.status = 422;
        throw error;
      }
      if (get(req.body, 'is_all_sources', false) === true) {
        const error = new Error();
        error.message = `Route with [${ALGORITHMS.ATA}] Algorithm shouldn't contain all sources.`;
        error.status = 422;
        throw error;
      }
      req.body.settings.rerouting_delay = 31535999;
      return next();
    }
    if (isRR(get(req.body, 'settings.algorithm'))) {
      if (uniqBy(filter(get(req.body, 'agents'), 'id'), 'id').length !== uniqBy(filter(get(req.body, 'agents'), 'order'), 'order').length) {
        const error = new Error();
        error.message = `Agent order for algorithm ${get(req.body, 'settings.algorithm')} is invalid: ${JSON.stringify(get(req.body, 'agents'))}`;
        error.status = 422;
        throw error;
      }
    }
    if (isWRR(get(req.body, 'settings.algorithm'))) {
      const error = new Error();
      error.message = 'Routing rule does not exist';
      error.status = 422;
      throw error;
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
