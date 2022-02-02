const { default: axios } = require('axios');
const { app: { kwcUrl } } = require('leadrouting-common/config');

/**
 * @param {number} teamId
 * @param {string} token
 *
 * @returns {Promise<Object>}
 *
 * @memberOf services/
 *
 * */
module.exports = async (teamId, token) => {
  const url = `${kwcUrl}/pno/api/v2/orgs/${teamId}`;
  const headers = {
    Authorization: token,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const options = {
    method: 'GET',
    headers,
    url,
  };
  const { data } = await axios.request({
    headers: options.headers,
    method: 'GET',
    url: options.url,
  });

  return data;
};
