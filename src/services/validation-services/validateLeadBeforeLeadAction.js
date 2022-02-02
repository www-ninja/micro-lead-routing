/* eslint-disable curly, consistent-return */
module.exports = (leadRouting) => {
  if (leadRouting === null) return Object.assign(new Error(), {
    status: 404,
    message: 'The lead doesn\'t exist',
  });

  if (leadRouting.claimed_by_kwuid === 0) return Object.assign(new Error(), {
    status: 409,
    message: 'The lead was sent to leadpool',
  });

  if (leadRouting.claimed_by_kwuid !== null) return Object.assign(new Error(), {
    status: 409,
    message: 'The lead is already claimed',
  });

  const [agent] = leadRouting.lead_routing_agents;
  if (agent.notified_at === null) return Object.assign(new Error(), {
    status: 403,
    message: 'The lead wasn\'t offered to you',
  });

  if (agent.passed_at) return Object.assign(new Error(), {
    status: 409,
    message: 'The lead was already passed by you',
  });
  return false;
};
