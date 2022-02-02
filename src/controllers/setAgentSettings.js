const { loggerWithPrefix } = require('leadrouting-common/libs');
const { AgentSettings } = require('leadrouting-common/models');

const LOGGER_PREFIX = 'agent::set::agent_settings =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

module.exports = async (req, res, next) => {
  try {
    const {
      params: { teamId, agentId },
      body: {
        email, is_mobile: isMobile, is_email: isEmail, is_command: isCommand,
      },
    } = req;

    logger.info(`init: ${JSON.stringify({
      teamId, agentId, email, isEmail, isMobile, isCommand,
    })}`);

    const query = {
      team_id: teamId,
      agent_kwuid: agentId,
    };

    const payload = {
      team_id: teamId,
      agent_kwuid: agentId,
      email,
      is_mobile: isMobile,
      is_email: isEmail,
      is_command: isCommand,
    };

    const [agentSetting, isNewAgentSetting] = await AgentSettings.findOrCreate({
      where: query,
      defaults: { ...payload, id: undefined },
    });

    if (!isNewAgentSetting) {
      agentSetting.update({
        email,
        is_mobile: isMobile,
        is_email: isEmail,
        is_command: isCommand,
      });
    }

    res
      .status(200)
      .send();
    return logger.info(`success: ${JSON.stringify(agentSetting)}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    return next(error);
  }
};
