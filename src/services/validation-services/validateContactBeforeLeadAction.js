const LEAD_PHASE = 2;

/* eslint-disable curly, consistent-return */
module.exports = (contact) => {
  if (contact === null) return Object.assign(new Error(), {
    status: 404,
    message: 'The contact doesn\'t exist',
  });

  if (contact.phase !== LEAD_PHASE) return Object.assign(new Error(), {
    status: 409,
    message: 'The contact is no longer considered as lead',
  });
  return false;
};
