const { FeatureFlags } = require('leadrouting-common/models');
const _ = require('lodash');

module.exports = async (payload) => {
  const query = {
    offset: Number(_.get(payload, 'offset', 0)),
    limit: Number(_.get(payload, 'limit', 10)),
    order: [
      ['created_at', 'desc'],
    ],
  };

  const flags = await FeatureFlags.findAll(query);

  return flags;
};
