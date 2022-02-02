
const { getServiceToken } = require('leadrouting-common/services');
const _ = require('lodash');
const getOrgByAgentId = require('./getOrgByAgentId');

/**
 *
 *
 * @param {*} teamList
 * @param {*} teamId
 * @return {boolean}
 */
const isTeamMember = (teamList, teamId) => {
  const found = _.find(teamList, { id: parseInt(teamId, 0) });
  return !!found;
};

/**
 * validateUserIds
 *
 * @param {number} userIds
 * @param {number} teamId
 */
module.exports = async (userIds, teamId) => {
  if (userIds && !userIds.includes('all')) {
    const validatePromises = userIds.map(async (userId) => {
      try {
        const token = await getServiceToken(userId);
        const data = await getOrgByAgentId(userId, token);
        if (!data || !isTeamMember(data, teamId)) {
          return false;
        }
        return true;
      } catch (error) {
        return false;
      }
    });

    const result = await Promise.all(validatePromises);

    return !result.includes(false);
  }
  return true;
};
