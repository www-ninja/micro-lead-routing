const validateContact = require('../../../src/services/validation-services/validateContactBeforeLeadAction');

describe('Service [validateContactBeforeLeadAction]', () => {
  const LEAD_PHASE = 2;

  test('Should return no errors', () => {
    const contact = {
      phase: LEAD_PHASE,
    };
    const contactErr = validateContact(contact);

    expect(contactErr).toBe(false);
  });

  test('Should return "Contact doesn\'t exist" error', () => {
    const contact = null;
    const contactErr = validateContact(contact);

    expect(contactErr.status).toBe(404);
    expect(contactErr.message).toBe('The contact doesn\'t exist');
  });

  test('Should return "No longer lead" error', () => {
    const contact = {
      phase: 0,
    };
    const contactErr = validateContact(contact);

    expect(contactErr.status).toBe(409);
    expect(contactErr.message).toBe('The contact is no longer considered as lead');
  });
});
