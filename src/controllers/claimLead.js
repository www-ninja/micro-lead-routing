const moment = require('moment');

const { LeadRoutings, LeadRoutingAgent } = require('leadrouting-common/models');
const { getContactById, claimLead } = require('leadrouting-common/requests');
const { loggerWithPrefix } = require('leadrouting-common/libs');
const {
  validateLeadBeforeLeadAction: validateLead,
  validateContactV3BeforeLeadAction: validateContactV3,
} = require('../services');
const { updateStatisticData } = require('../services');

const LOGGER_PREFIX = 'leads::claim =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);
const LEAD_ACTION_TYPE = 'claim';


/* eslint-disable consistent-return */
module.exports = async (request, response, next) => {
  try {
    const {
      params: { leadId },
      headers: { authorization },
    } = request;
    const agentId = request.user.id;
    logger.info(`agent #${JSON.stringify({ agentId })} is about to claim lead #${leadId}`);

    const leadRouting = await LeadRoutings.findOne({
      where: { lead_id: leadId },
      include: [{
        model: LeadRoutingAgent,
        where: {
          agent_kwuid: agentId,
        },
      }],
    });
    logger.info(`leadrouting: ${JSON.stringify({ leadRouting })}`);

    const leadErr = validateLead(leadRouting);

    if (leadErr) {
      logger.error(`lead-errors: ${JSON.stringify({ leadErr })}`);
      throw leadErr;
    }
    const xApiContactsToken = process.env.X_API_CONTACTS_TOKEN;
    let headers = {
      'x-api-contacts': xApiContactsToken,
      authorization,
    };
    const contact = await getContactById(headers, leadId);
    logger.info(`contact-v3: ${JSON.stringify({ contact })}`);

    const contactErr = validateContactV3(contact);
    if (contactErr) {
      logger.error(`contact-v3-errors: ${JSON.stringify({ contactErr })}`);
      throw contactErr;
    }

    headers = {
      authorization,
      'x-api-lead-routing': 1,
      'x-kwri-org': leadRouting.route_team_id,
    };
    await claimLead(headers, leadId, agentId);

    const claimedAt = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    await LeadRoutings.update({
      claimed_by_kwuid: agentId,
      to_check_at: null,
      claimed_at: claimedAt,
    }, {
      where: {
        id: leadRouting.id,
        claimed_by_kwuid: null,
      },
    });

    const res = {
      action: LEAD_ACTION_TYPE,
      data: {
        contact_id: leadId,
        agent_kwuid: Number(agentId),
        claimed_at: claimedAt,
        team_id: leadRouting.route_team_id,
      },
    };

    response
      .status(200)
      .json(res);
    logger.info(`response: ${JSON.stringify({ res })}`);

    const agent = leadRouting.lead_routing_agents[0];
    // Save to leadrouting_statistic table
    const statisticData = {
      type: 'ASSIGNMENT_EVENT',
      eventType: 'claim',
      timestamp: claimedAt,
      agentId,
      value: moment(agent.notified_at).toISOString(),
    };

    updateStatisticData(statisticData, leadRouting);
  } catch (err) {
    err.origin = `${LOGGER_PREFIX} failure`;
    next(err);
  }
};
