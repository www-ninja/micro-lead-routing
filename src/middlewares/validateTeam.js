const { ROLES } = require('../enums');

module.exports = async (req, res, next) => {
  try {
    const {
      params: { teamId },
    } = req;

    const { role } = req.user;

    if (role === ROLES.NOT_MEMBER || role === ROLES.UNKNOWN) {
      const error = new Error();
      error.message = `You are not a member of org id #${teamId}`;
      error.status = 409;

      return next(error);
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
