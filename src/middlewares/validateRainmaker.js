const { ROLES } = require('../enums');

module.exports = async (req, res, next) => {
  try {
    const {
      params: { teamId },
    } = req;

    const { role } = req.user;

    if (role === ROLES.NOT_MEMBER) {
      const error = new Error();
      error.message = `You are not a member of team with ID ${teamId}`;
      error.status = 409;

      return next(error);
    } if (role === ROLES.AGENT || role === ROLES.PERSONAL) {
      const error = new Error();
      error.message = "You're not a rainmaker/admin";
      error.status = 409;

      return next(error);
    } if (role === ROLES.UNKNOWN) {
      const error = new Error();
      error.message = "You're not a rainmaker/admin";
      error.status = 409;

      return next(error);
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
