const { default: axios } = require('axios');

module.exports = async (agentId, token) => {
  const url = `${process.env.KWC_URL}/pno/api/v2/people/${agentId}/orgs`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: token,
  };
  const { data } = await axios.get(url, { headers });
  return data.data;
};
