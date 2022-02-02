const { TEAM_ID_VALIDATION_ERROR } = require('../constants');
const { getTeamDetail } = require('../services');

const hasAuthorizationHeader = (token) => (!!token);
const isTeamAccount = (teamData) => (teamData && teamData.data && teamData.data.org_type.id === 7);


/**
 * checkTeamData
 *
 * @param {*} teamId
 * @param {*} token
 * @return {*}
 */
const checkTeamData = async (teamId, token) => {
  const teamData = await getTeamDetail(teamId, token);
  if (!teamData.data) {
    return TEAM_ID_VALIDATION_ERROR.invalidOrMissingTeamId;
  }

  if (!isTeamAccount(teamData)) {
    return TEAM_ID_VALIDATION_ERROR.invalidOrgType(teamId);
  }

  return false;
};

/**
 * validateTeamId
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 *
 */
module.exports = async (req, res, next) => {
  try {
    const {
      authorization,
    } = req.headers;
    if (!hasAuthorizationHeader(authorization)) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authorization',
      });
    }

    const { teamId } = req.params;
    const invalidTeam = await checkTeamData(teamId, authorization);
    if (invalidTeam) {
      return res.status(400).json({ message: invalidTeam });
    }

    return next();
  } catch (err) {
    if (err.response && err.response.status < 500) {
      return res.status(err.response.status).json({
        message: err.message,
      });
    }

    return res.status(500).json({
      message: `Something when wrong. ${JSON.stringify(err)}`,
    });
  }
};
