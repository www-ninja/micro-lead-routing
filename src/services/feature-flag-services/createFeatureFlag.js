/* eslint-disable camelcase */
const { FeatureFlags } = require('leadrouting-common/models');

const getUserIds = (userIds) => (userIds && userIds.length ? userIds.join() : 'all');

/**
 * Upserting data
 * @param {Object} payload number, Array<string>
 * @returns Array<Model>
 */
module.exports = async ({ teamId, userIds }) => {
  const exist = await FeatureFlags.findOne({ where: { team_id: teamId } });
  if (exist) return null;

  return FeatureFlags.create({
    team_id: teamId,
    user_ids: getUserIds(userIds),
  });
};
