const moment = require('moment');
const { loggerWithPrefix } = require('leadrouting-common/libs');
const { Op } = require('sequelize');
const { LeadRoutings } = require('leadrouting-common/models');
const { getOrgsByAgentId } = require('leadrouting-common/requests');
const { errorHandler } = require('../services');

const LOGGER_PREFIX = 'leads::digest::fetch =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

module.exports = async (req, res, next) => {
  try {
    const {
      query: {
        teamId, startDate, endDate,
      },
      headers: { authorization },
    } = req;

    if (!authorization) {
      const error = errorHandler('Unauthorized', 401);

      throw error;
    }

    if (!teamId) {
      const error = errorHandler('Team ID is required', 403);

      throw error;
    }

    const kwuid = req.user.id;
    const userTeams = await getOrgsByAgentId(kwuid);
    logger.info(`teams: ${JSON.stringify(userTeams.map(({ id }) => id))}`);
    // eslint-disable-next-line camelcase
    const isUserInTeam = userTeams.find(({ id }) => Number(id) === Number(teamId));
    if (!isUserInTeam) {
      const error = errorHandler('You are not a team member', 403);

      throw error;
    }

    logger.info(`start: ${JSON.stringify({
      kwuid, teamId, startDate, endDate,
    })}`);

    const filters = {
      route_team_id: teamId,
      lead_owner_kwuid: kwuid,
    };

    if (startDate) {
      const isValidStartDate = moment(startDate, 'YYYY-MM-DD HH:mm:ss', true).isValid();
      const currentDate = endDate || new Date().toISOString();
      const isValidEndDate = moment(currentDate, 'YYYY-MM-DD HH:mm:ss', true).isValid();

      if (!isValidStartDate) {
        const error = errorHandler(`Date format for startDate: ${startDate} is invalid`, 403);

        throw error;
      }

      if (!isValidEndDate) {
        const error = errorHandler(`Date format for endDate: ${endDate} is invalid`, 403);

        throw error;
      }
      filters.created_at = { [Op.between]: [startDate, currentDate] };
    }

    const leadRoutings = await LeadRoutings.findAll({ where: filters });

    // eslint-disable-next-line max-len
    const leadsRouted = leadRoutings.filter((leadRouting) => leadRouting.lead_routed_at && leadRouting.route_id);
    // eslint-disable-next-line max-len
    const leadsUnRouted = leadRoutings.filter((leadRouting) => !leadRouting.lead_routed_at || !leadRouting.route_id);
    const claimedLeads = leadRoutings.filter((leadRouting) => leadRouting.claimed_by_kwuid);
    const unClaimedLeads = leadRoutings.filter((leadRouting) => !leadRouting.claimed_by_kwuid);

    const data = {
      leads_routed: leadsRouted.length || 0,
      leads_unrouted: leadsUnRouted.length || 0,
      claimed_leads: claimedLeads.length || 0,
      unclaimed_leads: unClaimedLeads.length || 0,
      start_date: startDate || null,
      end_date: endDate || null,
      kwuid,
      team_id: teamId,
    };

    res
      .status(200)
      .json(data);
    return logger.info(`success: ${JSON.stringify(data)}`);
  } catch (error) {
    error.origin = `${LOGGER_PREFIX} failure`;
    return next(error);
  }
};
