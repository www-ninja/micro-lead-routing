const { loggerWithPrefix } = require('leadrouting-common/libs');
const { AgentSettings } = require('leadrouting-common/models');
const { getAgentById } = require('leadrouting-common/requests');
const postAuditMessage = require('../services/postAuditMessage');

const LOGGER_PREFIX = 'agents::set::maximum_leads =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

module.exports = async (req, res, next) => {
  try {
    const {
      params: { teamId, agentId },
      body: { maximum_leads: maximumLeads },
    } = req;

    logger.info(`init: ${JSON.stringify({ agentId, teamId, maximumLeads })}`);

    const query = {
      team_id: teamId,
      agent_kwuid: agentId,
    };

    const [agentSetting, isNewAgentSetting] = await AgentSettings.findOrCreate({
      where: query,
      defaults: { ...query, maximum_leads: maximumLeads },
    });

    if (!isNewAgentSetting) {
      agentSetting.update({
        maximum_leads: maximumLeads,
      });
    }

    res
      .status(200)
      .send({ maximum_leads: agentSetting.maximum_leads });

    try {
      const agentData = await getAgentById(agentId);

      const payload = {
        activity: {
          type: 'LEAD MANAGEMENT',
          sub_type: 'SET LEAD LIMIT',
          timestamp: new Date().toISOString(),
          message: `${req.user.userFullName} set a lead limit for ${agentData.first_name} ${agentData.last_name}`,
          more_info: `userid: ${req.user.id}, agentId: ${agentId}, maximum leads: ${maximumLeads}`,
        },
      };
      await postAuditMessage(req, payload);
    } catch (error) {
      logger.info(error.message);
    }

    return logger.info(`success: ${JSON.stringify(agentSetting)}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    return next(error);
  }
};
