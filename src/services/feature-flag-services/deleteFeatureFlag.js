const { FeatureFlags } = require('leadrouting-common/models');

module.exports = async (payload) => {
  const query = {
    where: {
      team_id: payload.teamId,
    },
    force: true,
  };
  await FeatureFlags.destroy(query);

  return query;
};
