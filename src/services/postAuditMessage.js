/* eslint-disable camelcase */
const axios = require('axios');

module.exports = async (req, payload = {}) => {
  const {
    params: { teamId, agentId },
    body: { time, route_id },
    headers: { authorization },
    user,
  } = req;

  const userInfoHeader = req.headers['x-userinfo'].toString();

  const headers = {
    authorization,
    'x-userinfo': userInfoHeader.replace(/\\"/g, '"'),
    'Content-Type': 'application/json',
  };

  const data = {
    system: 'COMMAND',
    sub_system: 'LEADROUTING',
    version: 1,
    who: {
      id: user.id,
      name: user.userFullName,
    },
    org: {
      id: teamId,
      type: 'team',
    },
    activity: {
      type: 'PAUSE LEAD ASSIGNMENT',
      sub_type: 'AGENT PAUSE',
      timestamp: process.env.NODE_ENV === 'test' ? '' : new Date().toISOString(),
      message: `${user.userFullName}(${user.id}) has been pause ${agentId}'s lead`,
      more_info: `time: ${time}, route id: ${route_id}`,
    },
    ...payload,
  };

  if (process.env.NODE_ENV === 'test') {
    return data;
  }
  const config = {
    url: `${process.env.KWC_URL}/audit-publisher/api/v1/message`,
    method: 'post',
    headers,
    data,
  };

  const response = await axios.request(config);
  return response.data;
};
