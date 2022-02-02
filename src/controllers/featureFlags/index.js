const createFeatureFlag = require('./createFeatureFlag');
const deleteFeatureFlag = require('./deleteFeatureFlag');
const getFeatureFlagByTeam = require('./getFeatureFlagByTeam');
const getFeatureFlags = require('./getFeatureFlags');
const updateFeatureFlag = require('./updateFeatureFlag');

module.exports = {
  createFeatureFlag,
  deleteFeatureFlag,
  getFeatureFlags,
  getFeatureFlagByTeam,
  updateFeatureFlag,
};
