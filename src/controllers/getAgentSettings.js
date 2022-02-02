const { loggerWithPrefix } = require('leadrouting-common/libs');
const { AgentSettings } = require('leadrouting-common/models');

const LOGGER_PREFIX = 'agentSettings::fetch =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

module.exports = async (req, res, next) => {
  try {
    const {
      params: { agentId, teamId },
    } = req;
    logger.info(`init: ${JSON.stringify({ agentId, teamId })}`);

    const query = {
      team_id: teamId,
      agent_kwuid: agentId,
    };

    const agentSetting = await AgentSettings.findOne({
      where: query,
    });

    res.status(200)
      .json(agentSetting);
    return logger.info(`success: ${JSON.stringify({ agentSetting })}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    return next(error);
  }
};
