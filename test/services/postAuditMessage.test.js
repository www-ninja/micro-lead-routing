const postAuditMessage = require('../../src/services/postAuditMessage');

jest.mock('leadrouting-common/requests/getAgentById');

describe('Service [postAuditMessage]', () => {
  let req = {
    params: { teamId: 3000, agentId: 60000 },
    body: { time: -123 },
    headers: {
      authorization: 'Bearer test',
      'x-userinfo': '',
    },
    user: {
      id: 70000,
      userFullName: 'test user',
    },
  };
  beforeEach(async (done) => {
    done();
  });

  test('Should Route Create payload', async () => {
    const auditPayload = {
      activity: {
        type: 'ROUTE MANAGEMENT',
        sub_type: 'ROUTE CREATE',
        timestamp: '',
        message: `${req.user.userFullName} created route - test`,
        more_info: `userid: ${req.user.id}, team id: 3000, route id: 1`,
      },
    };

    const data = await postAuditMessage(req, auditPayload);

    expect(data).toStrictEqual({
      activity: {
        message: 'test user created route - test',
        more_info: 'userid: 70000, team id: 3000, route id: 1',
        sub_type: 'ROUTE CREATE',
        timestamp: '',
        type: 'ROUTE MANAGEMENT',
      },
      org: {
        id: 3000,
        type: 'team',
      },
      sub_system: 'LEADROUTING',
      system: 'COMMAND',
      version: 1,
      who: {
        id: 70000,
        name: 'test user',
      },
    });
  });

  test('Should Route Delete payload', async () => {
    const auditPayload = {
      activity: {
        type: 'ROUTE MANAGEMENT',
        sub_type: 'ROUTE DELETE',
        timestamp: '',
        message: `${req.user.userFullName} deleted route - test`,
        more_info: `userid: ${req.user.id}, route id: 1`,
      },
    };

    const data = await postAuditMessage(req, auditPayload);

    expect(data).toStrictEqual({
      activity: {
        message: 'test user deleted route - test',
        more_info: 'userid: 70000, route id: 1',
        sub_type: 'ROUTE DELETE',
        timestamp: '',
        type: 'ROUTE MANAGEMENT',
      },
      org: {
        id: 3000,
        type: 'team',
      },
      sub_system: 'LEADROUTING',
      system: 'COMMAND',
      version: 1,
      who: {
        id: 70000,
        name: 'test user',
      },
    });
  });

  test('Should Route Archive payload', async () => {
    const auditPayload = {
      activity: {
        type: 'ROUTE MANAGEMENT',
        sub_type: 'ROUTE ARCHIVE',
        timestamp: '',
        message: `${req.user.userFullName} archived route - test`,
        more_info: `userid: ${req.user.id}, route id: 1`,
      },
    };

    const data = await postAuditMessage(req, auditPayload);

    expect(data).toStrictEqual({
      activity: {
        message: 'test user archived route - test',
        more_info: 'userid: 70000, route id: 1',
        sub_type: 'ROUTE ARCHIVE',
        timestamp: '',
        type: 'ROUTE MANAGEMENT',
      },
      org: {
        id: 3000,
        type: 'team',
      },
      sub_system: 'LEADROUTING',
      system: 'COMMAND',
      version: 1,
      who: {
        id: 70000,
        name: 'test user',
      },
    });
  });

  test('Should Route Restore payload', async () => {
    const auditPayload = {
      activity: {
        type: 'ROUTE MANAGEMENT',
        sub_type: 'ROUTE RESTORE',
        timestamp: '',
        message: `${req.user.userFullName} restored route - test`,
        more_info: `userid: ${req.user.id}, route id: 1`,
      },
    };

    const data = await postAuditMessage(req, auditPayload);

    expect(data).toStrictEqual({
      activity: {
        message: 'test user restored route - test',
        more_info: 'userid: 70000, route id: 1',
        sub_type: 'ROUTE RESTORE',
        timestamp: '',
        type: 'ROUTE MANAGEMENT',
      },
      org: {
        id: 3000,
        type: 'team',
      },
      sub_system: 'LEADROUTING',
      system: 'COMMAND',
      version: 1,
      who: {
        id: 70000,
        name: 'test user',
      },
    });
  });

  test('Should Route Pause payload', async () => {
    const auditPayload = {
      activity: {
        type: 'ROUTE MANAGEMENT',
        sub_type: 'ROUTE PAUSE',
        timestamp: '',
        message: `${req.user.userFullName} paused route - test`,
        more_info: `userid: ${req.user.id}, route id: 1`,
      },
    };

    const data = await postAuditMessage(req, auditPayload);

    expect(data).toStrictEqual({
      activity: {
        message: 'test user paused route - test',
        more_info: 'userid: 70000, route id: 1',
        sub_type: 'ROUTE PAUSE',
        timestamp: '',
        type: 'ROUTE MANAGEMENT',
      },
      org: {
        id: 3000,
        type: 'team',
      },
      sub_system: 'LEADROUTING',
      system: 'COMMAND',
      version: 1,
      who: {
        id: 70000,
        name: 'test user',
      },
    });
  });

  test('Should Route Resume payload', async () => {
    const auditPayload = {
      activity: {
        type: 'ROUTE MANAGEMENT',
        sub_type: 'ROUTE RESUME',
        timestamp: '',
        message: `${req.user.userFullName} resumed route - test`,
        more_info: `userid: ${req.user.id}, route id: 1`,
      },
    };

    const data = await postAuditMessage(req, auditPayload);

    expect(data).toStrictEqual({
      activity: {
        message: 'test user resumed route - test',
        more_info: 'userid: 70000, route id: 1',
        sub_type: 'ROUTE RESUME',
        timestamp: '',
        type: 'ROUTE MANAGEMENT',
      },
      org: {
        id: 3000,
        type: 'team',
      },
      sub_system: 'LEADROUTING',
      system: 'COMMAND',
      version: 1,
      who: {
        id: 70000,
        name: 'test user',
      },
    });
  });

  test('Should Route Edit payload', async () => {
    const auditPayload = {
      activity: {
        type: 'ROUTE MANAGEMENT',
        sub_type: 'ROUTE EDIT',
        timestamp: '',
        message: `${req.user.userFullName} edited route - test`,
        more_info: `userid: ${req.user.id}, route id: 1`,
      },
    };

    const data = await postAuditMessage(req, auditPayload);

    expect(data).toStrictEqual({
      activity: {
        message: 'test user edited route - test',
        more_info: 'userid: 70000, route id: 1',
        sub_type: 'ROUTE EDIT',
        timestamp: '',
        type: 'ROUTE MANAGEMENT',
      },
      org: {
        id: 3000,
        type: 'team',
      },
      sub_system: 'LEADROUTING',
      system: 'COMMAND',
      version: 1,
      who: {
        id: 70000,
        name: 'test user',
      },
    });
  });

  test('Should AGENT PAUSE payload', async () => {
    const auditPayload = {
      activity: {
        type: 'PAUSE LEAD ASSIGNMENT',
        sub_type: 'AGENT PAUSE',
        timestamp: '',
        message: `${req.user.userFullName} has been pause test test's lead`,
        more_info: 'time: 0',
      },
    };

    const data = await postAuditMessage(req, auditPayload);

    expect(data).toStrictEqual({
      activity: {
        message: "test user has been pause test test's lead",
        more_info: 'time: 0',
        sub_type: 'AGENT PAUSE',
        timestamp: '',
        type: 'PAUSE LEAD ASSIGNMENT',
      },
      org: {
        id: 3000,
        type: 'team',
      },
      sub_system: 'LEADROUTING',
      system: 'COMMAND',
      version: 1,
      who: {
        id: 70000,
        name: 'test user',
      },
    });
  });

  test('Should AGENT PAUSE ROUTE payload', async () => {
    req = {
      ...req,
      body: { time: -123, route_id: 1 },
    };
    const data = await postAuditMessage(req);

    expect(data).toStrictEqual({
      activity: {
        message: "test user(70000) has been pause 60000's lead",
        more_info: 'time: -123, route id: 1',
        sub_type: 'AGENT PAUSE',
        timestamp: '',
        type: 'PAUSE LEAD ASSIGNMENT',
      },
      org: {
        id: 3000,
        type: 'team',
      },
      sub_system: 'LEADROUTING',
      system: 'COMMAND',
      version: 1,
      who: {
        id: 70000,
        name: 'test user',
      },
    });
  });
  test('Should Maximum Leads payload', async () => {
    const auditPayload = {
      activity: {
        type: 'AGENT MANAGEMENT',
        sub_type: 'EDIT MAXIMUM LEADS',
        timestamp: '',
        message: `${req.user.userFullName} set a lead limit for testUser`,
        more_info: `userid: ${req.user.id}, agentId: 123456, maximum leads: 20`,
      },
    };

    const data = await postAuditMessage(req, auditPayload);

    expect(data).toStrictEqual({
      system: 'COMMAND',
      sub_system: 'LEADROUTING',
      version: 1,
      who: {
        id: 70000,
        name: 'test user',
      },
      org: {
        id: 3000,
        type: 'team',
      },
      activity: {
        type: 'AGENT MANAGEMENT',
        sub_type: 'EDIT MAXIMUM LEADS',
        timestamp: '',
        message: 'test user set a lead limit for testUser',
        more_info: 'userid: 70000, agentId: 123456, maximum leads: 20',
      },
    });
  });
});
