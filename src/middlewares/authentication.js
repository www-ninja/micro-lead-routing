const Sentry = require('@sentry/node');
const { set, get } = require('lodash');
const { getAem } = require('leadrouting-common/requests');
const { ROLES } = require('../enums');
const { CONSUMERS } = require('../constants');

const handleServiceAccount = (req) => {
  let kwoid = null;
  let email = null;
  let kwuids = null;

  const userId = req.header('x-consumer-token-user-id');
  if (!userId) {
    const error = new Error();
    error.message = 'User unauthorized.';
    error.status = 403;
    throw error;
  }
  Sentry.setUser({ id: userId });

  const userEmail = req.header('x-consumer-token-user-email').split('=')
    .pop();
  const matchEmail = /\S+@\S+\.\S+/;

  if (matchEmail.test(userEmail)) {
    email = userEmail;
  }
  // get the group for specific consumer
  const isSupportedConsumer = CONSUMERS.includes(req.header('x-consumer-aid'));
  if (isSupportedConsumer) {
    if (req.header('x-kwcommand-group')) {
      kwoid = req.header('x-kwcommand-group').split('=').pop();
      set(req, 'user.kwGroupMembers', kwuids);
    }

    if (req.header('x-kwcommand-group-members')) {
      kwuids = req.header('x-kwcommand-group-members').split(';');
      set(req, 'user.kwoid', kwoid);
    }
  }

  set(req, 'user', {
    id: userId,
    email,
    consumer: req.header('x-consumer-aid'),
    isService: true,
  });
};

const handleGeneralInfo = (req) => {
  if (!req.header('x-userinfo')) {
    const error = new Error();
    error.message = 'User unauthorized.';
    error.status = 403;
    throw error;
  }

  const userInfoHeader = req.headers['x-userinfo'].toString();
  const userInfo = JSON.parse(userInfoHeader.replace(/\\"/g, '"'));

  const kwuid = get(userInfo, 'custom_fields.KW_UID', undefined);

  if (!userInfo || !kwuid) {
    const error = new Error();
    error.message = 'Bad request.';
    error.status = 400;
    throw error;
  }

  const firstName = get(userInfo, 'given_name', '');
  const lastName = get(userInfo, 'family_name', '');
  const userFullName = `${firstName} ${lastName}`;

  req.user = {
    id: kwuid,
    email: get(userInfo, 'email', ''),
    isService: false,
    userFullName,
  };
};

module.exports = async (req, res, next) => {
  const {
    params: { teamId },
    headers: { authorization },
  } = req;

  try {
    if (!authorization) {
      const error = new Error();
      error.message = 'User unauthorized.';
      error.status = 403;
      throw error;
    }

    if (req.header('x-userinfo')) {
      handleGeneralInfo(req);
    } else {
      handleServiceAccount(req);
    }
    let role = ROLES.UNKNOWN;

    if (teamId) {
      const aemData = await getAem(+req.user.id, +teamId);
      const { actions } = aemData;

      if (actions.length > 0) {
        const action = actions[0];

        if (action.access_level === 'unlimited') {
          role = ROLES.RAIN_MAKER;
        } else if (action.access_level === 'enhanced') {
          role = ROLES.RAIN_MAKER;
        } else if (action.access_level === 'standard') {
          role = ROLES.AGENT;
        } else if (action.access_level === 'personal') {
          role = ROLES.PERSONAL;
        } else {
          role = ROLES.UNKNOWN;
        }
      } else {
        role = ROLES.NOT_MEMBER;
      }
    }
    set(req, 'user.role', role);

    return next();
  } catch (error) {
    return next(error);
  }
};
