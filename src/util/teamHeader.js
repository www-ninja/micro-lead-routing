const { ROLES } = require('../enums');

/* eslint no-param-reassign: "error" */
module.exports = async (headers, orgId, userRole) => {
  if (process.env.NODE_ENV === 'local') {
    delete headers.host;
  }

  let roleName = '';

  if (!headers['x-kwri-org'] || !headers['x-kwapp-roles']) {
    switch (userRole) {
      case ROLES.RAIN_MAKER:
        roleName = 'Rainmaker';
        break;
      case ROLES.AGENT:
        roleName = 'Agent';
        break;
      case ROLES.PERSONAL:
        roleName = 'Personal';
        break;
      case ROLES.NOT_MEMBER:
        roleName = 'Not Member';
        break;
      default:
        roleName = 'Unknown';
        break;
    }
    headers['x-kwri-org'] = orgId;
    headers['x-kwapp-roles'] = `{"${orgId}": "${roleName}"}`;
  }
};
