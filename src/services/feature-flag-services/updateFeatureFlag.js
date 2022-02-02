const { FeatureFlags } = require('leadrouting-common/models');
const _ = require('lodash');

const setMembers = (existMembers, newIds) => {
  let userIds = existMembers.split(',');
  userIds.push(newIds);
  if (newIds && newIds.includes('all')) {
    userIds = ['all'];
  }

  if (userIds.length > 1) {
    userIds = _.clone(userIds.filter((val) => val !== 'all'));
  }

  return _.uniq(_.flatten(userIds));
};

module.exports = async (teamId, userIds) => {
  const exist = await FeatureFlags.findOne({ where: { team_id: teamId }, raw: true });
  if (!exist) return null;

  const existUserIds = exist.user_ids;
  const newUserIds = setMembers(existUserIds, userIds);

  await FeatureFlags.update({
    user_ids: newUserIds.join(),
  }, { where: { team_id: teamId }, returning: true });

  return FeatureFlags.findOne({ where: { team_id: teamId } });
};
