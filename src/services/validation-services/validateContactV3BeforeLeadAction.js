
/* eslint-disable curly, consistent-return */
module.exports = (contact) => {
  if (contact === null) return Object.assign(new Error(), {
    status: 404,
    message: 'The contact doesn\'t exist in V3',
  });

  if (!contact.contactTypes.includes('LEAD')) return Object.assign(new Error(), {
    status: 409,
    message: 'The contact is no longer considered as lead in V3',
  });
  return false;
};
