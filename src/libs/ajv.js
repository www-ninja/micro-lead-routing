const Ajv = require('ajv');
const ajvKeywords = require('ajv-keywords');
const { get } = require('lodash');
const {
  createRoute,
  updateRoute,
  setPausedAgent,
  setPausedRoute,
  updateRouteOrder,
  updateRouteATA,
  setAgentSettings,
  setMaximumLeads,
  queryParams,
  setFeatureFlag,
  updateFeatureFlag,
} = require('../schemas');

const isTotalWeightValid = (schema, data) => {
  if (get(data, 'settings.is_simple_weight')) return true;
  return data.agents.reduce((a, c) => a + c.weight, 0) === 100;
};

const ajv = new Ajv({ coerceTypes: true, useDefaults: true });
ajvKeywords(ajv, ['transform']);

ajv.addKeyword('compareActiveTime', {
  validate: (schema, data) => (!data.active_from && !data.active_until)
    || (data.active_from < data.active_until && data.active_from > 0 && data.active_until > 0),
  errors: false,
});

// Total agents weight equals 100 for Weighted Round Robin rule
ajv.addKeyword('validateWeight', {
  validate: (schema, data) => get(data, 'settings.algorithm') !== 'Weighted Round Robin' || isTotalWeightValid(schema, data),
  errors: false,
});

// TODO: this should created at loop automatically
ajv.addSchema(createRoute, 'createRoute');
ajv.addSchema(updateRoute, 'updateRoute');
ajv.addSchema(updateRouteOrder, 'updateRouteOrder');
ajv.addSchema(setPausedAgent, 'setPausedAgent');
ajv.addSchema(setPausedRoute, 'setPausedRoute');
ajv.addSchema(updateRouteATA, 'updateRouteATA');
ajv.addSchema(setAgentSettings, 'setAgentSettings');
ajv.addSchema(setMaximumLeads, 'setMaximumLeads');
ajv.addSchema(queryParams, 'queryParams');
ajv.addSchema(setFeatureFlag, 'setFeatureFlag');
ajv.addSchema(updateFeatureFlag, 'updateFeatureFlag');

module.exports = ajv;
