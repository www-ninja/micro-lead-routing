const validateLead = require('../../../src/services/validation-services/validateLeadBeforeLeadAction');

describe('Service [validateLeadBeforeLeadAction]', () => {
  test('Should return no errors', () => {
    const leadRouting = {
      claimed_by_kwuid: null,
      lead_routing_agents: [{
        agent_kwuid: 556396,
        notified_at: 1252476549999, // 2009-09-09 09:09:09:999
      }],
    };
    const err = validateLead(leadRouting);

    expect(err).toBe(false);
  });

  test('Should return "Lead doesn\'t esist" error', () => {
    const leadRouting = null;
    const err = validateLead(leadRouting);

    expect(err)
      .toStrictEqual(Object.assign(new Error(), {
        status: 404,
        message: 'The lead doesn\'t exist',
      }));
  });

  test('Should return "Sent to leadpool"  error', () => {
    const leadRouting = {
      claimed_by_kwuid: 0,
    };
    const err = validateLead(leadRouting);

    expect(err.status).toBe(409);
    expect(err.message).toBe('The lead was sent to leadpool');
  });

  test('Should return "Already claimed"  error', () => {
    const leadRouting = {
      claimed_by_kwuid: 556396,
    };
    const err = validateLead(leadRouting);

    expect(err.status).toBe(409);
    expect(err.message).toBe('The lead is already claimed');
  });

  test('Should return "Not offered"  error', () => {
    const leadRouting = {
      claimed_by_kwuid: null,
      lead_routing_agents: [{
        notified_at: null,
      }],
    };
    const err = validateLead(leadRouting);

    expect(err.status).toBe(403);
    expect(err.message).toBe('The lead wasn\'t offered to you');
  });

  test('Should return "Already passed"  error', () => {
    const leadRouting = {
      claimed_by_kwuid: null,
      lead_routing_agents: [{
        notified_at: 1252476549999, // 2009-09-09 09:09:09:999
        passed_at: 1252476549999, // 2009-09-09 09:09:09:999
      }],
    };
    const err = validateLead(leadRouting);

    expect(err.status).toBe(409);
    expect(err.message).toBe('The lead was already passed by you');
  });
});
