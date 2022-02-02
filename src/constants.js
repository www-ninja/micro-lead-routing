const ENVIRONMENT = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  QA: 'qa',
};

const CONSUMERS = ['teamGateway', 'mcGateway', 'contacts'];
const IGNORE_ERRORS = [400, 401, 403, 404, 409];

const TEAM_ID_VALIDATION_ERROR = {
  invalidOrMissingTeamId: 'Missing or invalid org id',
  invalidOrgType: (teamId) => `The org id #${teamId} is not team`,
};

module.exports = {
  ENVIRONMENT,
  IGNORE_ERRORS,
  CONSUMERS,
  TEAM_ID_VALIDATION_ERROR,
};
