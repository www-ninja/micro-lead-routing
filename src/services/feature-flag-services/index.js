const getFeatureFlags = require('./getFeatureFlags');
const deleteFeatureFlag = require('./deleteFeatureFlag');
const updateFeatureFlag = require('./updateFeatureFlag');
const createFeatureFlag = require('./createFeatureFlag');
const getFeatureFlagByTeam = require('./getFeatureFlagByTeam');

module.exports = {
  getFeatureFlags,
  deleteFeatureFlag,
  updateFeatureFlag,
  createFeatureFlag,
  getFeatureFlagByTeam,
};
