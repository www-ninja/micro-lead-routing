const { getContactById } = require('leadrouting-common/requests');
const { LeadRoutings, LeadRoutingAgent } = require('leadrouting-common/models');
const { pubsub, loggerWithPrefix } = require('leadrouting-common/libs');
const { app: { leadActionTopic } } = require('leadrouting-common/config');
const {
  validateLeadBeforeLeadAction: validateLead,
  validateContactV3BeforeLeadAction: validateContactV3,
} = require('../services');

const LOGGER_PREFIX = 'leads::pass =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);
const LEAD_ACTION_TYPE = 'pass';

/* eslint-disable consistent-return */
module.exports = async (request, response, next) => {
  try {
    const {
      params: { leadId },
      headers: { authorization },
    } = request;
    const agentId = request.user.id;
    logger.info(`agent #${JSON.stringify({ agentId })} is about to pass lead #${leadId}`);

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
    const headers = {
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

    const res = {
      action: LEAD_ACTION_TYPE,
      data: {
        contact_id: leadId,
        agent_kwuid: Number(agentId),
        passed_at: Date.now(),
        team_id: leadRouting.route_team_id,
      },
    };

    if (!process.env.PUBSUB_DISABLED) {
      await pubsub.topic(leadActionTopic)
        .publishJSON(res);
      logger.info(`message: ${JSON.stringify({ res })}`);
    }

    response
      .status(200)
      .json(res);
    logger.info(`response: ${JSON.stringify({ res })}`);
  } catch (err) {
    err.origin = `${LOGGER_PREFIX} failure`;
    next(err);
  }
};
