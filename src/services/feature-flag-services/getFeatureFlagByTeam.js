const { FeatureFlags } = require('leadrouting-common/models');

module.exports = async (payload) => {
  const query = {
    where: {
      team_id: payload.teamId,
    },
  };
  const data = await FeatureFlags.findOne(query);

  return data;
};
