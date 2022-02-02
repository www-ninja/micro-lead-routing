const { set } = require('lodash');

const setHeaders = (headers = {}, kwuid) => {
  set(headers, 'x-userinfo', JSON.stringify({
    custom_fields: {
      KW_UID: `${kwuid}`,
    },
    email: 'kelle1@kw.com',
    given_name: 'nicole',
    family_name: 'burton',
  }));

  if (!headers.authorization) {
    set(headers, 'authorization', 'rainmaker');
  }
  set(headers, 'Accept', 'application/json');

  return headers;
};

module.exports = {
  setHeaders,
};
