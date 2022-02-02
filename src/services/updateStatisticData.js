/* eslint-disable max-len */
const { LeadRoutingStatistics } = require('leadrouting-common/models');
const { pubsub, loggerWithPrefix } = require('leadrouting-common/libs');

const LOGGER_PREFIX = 'leads::updateStatisticData =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

/**
 * Update LeadRoutingStatistics and publish to leadrouting-statistic service
 *
 * throws
 *
 * @param {Object} payload - {type: string, eventType: string, timestamp: Date, agentId: number, value: string}
 * @param {import('leadrouting-common/models/leadRoutings').LeadRoutings} leadRouting
 * @return {Promise<Array<import('leadrouting-common/models/leadRoutingStatistics')>>}
 */
const updateStatisticData = async (payload, leadRouting) => {
  const {
    type,
    eventType,
    timestamp,
    agentId,
    value,
  } = payload;

  const data = {
    lead_id: leadRouting.lead_id,
    team_id: leadRouting.route_team_id,
    agent_kwuid: agentId,
    event_type: eventType,
    timestamp,
    value,
  };

  const statistic = await LeadRoutingStatistics.create(data);
  logger.info(`lead-routings #${leadRouting.id}: leadrouting statistic data created with ID #${statistic.id} and payload: ${JSON.stringify(statistic)}`);

  const pubsubPayload = {
    type,
    data: {
      leadId: leadRouting.lead_id,
      agentId,
      teamId: leadRouting.route_team_id,
      claimedAt: timestamp,
      notifiedAt: value,
    },
  };

  // Publish PubSub message to LR Statistic Service
  const topicName = process.env.LEADROUTING_STATISTIC_TOPIC;
  logger.info(`lead-routings #${leadRouting.id}: publishing pubsub message to topic ${topicName} with payload: ${JSON.stringify(pubsubPayload)}`);

  if (!process.env.PUBSUB_DISABLED) {
    await pubsub.topic(topicName)
      .publishJSON(pubsubPayload);
  }
};

module.exports = updateStatisticData;
